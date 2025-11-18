from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status, viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
import django_filters
from django.db.models import F
from django.db.models.expressions import RawSQL
from langdetect import detect

from ollama import Client
import json

from .models import Ley, Pregunta
from .serializers import LeySerializer, PreguntaSerializer

from sentence_transformers import SentenceTransformer

ollama = Client()

model_emb = SentenceTransformer("BAAI/bge-m3")

# Filtros avanzados por título y tema
class LeyFilter(django_filters.FilterSet):
    titulo = django_filters.CharFilter(field_name="titulo", lookup_expr='icontains')
    tema = django_filters.CharFilter(field_name="tema__tema", lookup_expr='icontains')

    class Meta:
        model = Ley
        fields = ['titulo', 'tema']

class LeyViewSet(viewsets.ModelViewSet):
    queryset = Ley.objects.all()
    serializer_class = LeySerializer

    # Habilitar filtros y búsqueda
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_class = LeyFilter
    search_fields = ['titulo', 'tema__tema']  # búsqueda por parámetro ?search=

    @action(detail=False, methods=['post'])
    def bulk(self, request):
        serializer = LeySerializer(data=request.data, many=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'])
    def semantic(self, request):
        query = request.data.get("q", None)
        historial_mensajes = request.data.get("h", None)
        if not query:
            return Response({"error": "Debes enviar ?q=<texto>"}, status=400)

        # 1. Obtener embedding de la consulta (lista de floats)
        query_emb = model_emb.encode(query).tolist()
        query_emb = "[" + ",".join([str(x) for x in query_emb]) + "]"

        preguntas_parecidas = Pregunta.objects.exclude(embedding=None).annotate(
            distance=RawSQL("embedding <-> %s", (query_emb,))
        ).order_by("distance")[:1]
        preguntas_parecidas = PreguntaSerializer(preguntas_parecidas, many=True).data
        preguntas_parecidas = [pregunta for pregunta in preguntas_parecidas if pregunta["distance"] < 0.5]
        resumen = ""
        print(historial_mensajes)

        if len(preguntas_parecidas) > 0 and (historial_mensajes is None or historial_mensajes == []):
            print("hay una prehunta parecida")
            pregunta_parecida = preguntas_parecidas[0]
            pregunta = PreguntaSerializer(data={"pregunta": query, "leyes": pregunta_parecida["leyes"], "mensajes": [], "resumen": pregunta_parecida["resumen"], "embedding": pregunta_parecida["embedding"]})
            resumen = pregunta_parecida["resumen"]
            leyes = Ley.objects.filter(id__in=pregunta_parecida["leyes"])
            leyes_serial = LeySerializer(leyes, many=True).data
            texto = ""
            for ley in leyes:
                texto += f"Título: {ley.titulo}\n"
                texto += f"Temas: {', '.join([t.tema for t in ley.tema.all()])}\n"
                texto += f"Contenido:\n{ley.contenido_pdf}\n\n"
                texto += f"Consulta: {query}\n"

            # 4) Llamar a Ollama local para un resumen
            prompt = f"""
            Resume de forma clara y natural el siguiente texto legal. 
            Enuncia los puntos clave, propósito de la ley y efectos principales. Toma en cuenta que fueron seleccionadas en base a su similitud semántica con la consulta del usuario.
            Texto:
            {texto}

            """
            historial_mensajes = [
                {
                    "role": "system",
                    "content": prompt
                },
                {
                    "role": "assistant",
                    "content": resumen
                }
            ]
            if pregunta.is_valid():
                pregunta.save()
            else:
                print("pregunta no valida")
                print(pregunta.errors)
        else:
            print("no hay una pregunta parecida o es un chat")
            # 2. Usar RawSQL para invocar el operador de pgvector (<-> = distancia euclidiana)
            leyes = Ley.objects.exclude(embedding=None).annotate(
                distance=RawSQL("embedding <-> %s", (query_emb,))
            ).order_by("distance")[:1]

            # 3) Construir texto combinado
            texto = ""
            for ley in leyes:
                texto += f"Título: {ley.titulo}\n"
                texto += f"Temas: {', '.join([t.tema for t in ley.tema.all()])}\n"
                texto += f"Contenido:\n{ley.contenido_pdf}\n\n"
                texto += f"Consulta: {query}\n"

            # 4) Llamar a Ollama local para un resumen
            prompt = f"""
            Resume de forma clara y natural el siguiente texto legal. 
            Enuncia los puntos clave, propósito de la ley y efectos principales. Toma en cuenta que fueron seleccionadas en base a su similitud semántica con la consulta del usuario.
            Texto:
            {texto}

            """
            messages = [{
                "role": "system",
                "content": prompt
            }] if historial_mensajes == [] or historial_mensajes is None else []
            if historial_mensajes:
                for msg in historial_mensajes:
                    messages.append(msg)

            result = ollama.chat(
                model="llama3",
                messages=messages
            )
            print("Ollama response:", result)

            messages.append(result["message"])
            resumen = messages[1]["content"].strip()
            historial_mensajes = messages

            leyes_serial = LeySerializer(leyes, many=True).data
            leyes_ids = [obj["id"] for obj in leyes_serial]

            # 5) Detect language
            try:
                lang = detect(resumen)
            except:
                lang = "unknown"

            # 6) If not Spanish, translate locally
            if lang != "es":
                translate_prompt = f"""
                Traduce el siguiente texto al español, manteniendo precisión legal:
                {resumen}
                """

                translated = ollama.generate(
                    model="llama3",
                    prompt=translate_prompt
                )

                resumen = translated["response"].strip()

            pregunta = PreguntaSerializer(data={"pregunta": query, "leyes": leyes_ids, "resumen": resumen, "embedding": query_emb})
            if pregunta.is_valid():
                pregunta.save()
            else:
                print("pregunta no valida")
                print(pregunta.errors)

        return Response({
            "query": query,
            "query_emb": query_emb,
            "resumen": resumen,
            "resultados": leyes_serial,
            "historial_mensajes": historial_mensajes
        })