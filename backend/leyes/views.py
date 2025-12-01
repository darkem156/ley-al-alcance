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
import requests

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
    
    @action(detail=False, methods=['get'])
    def ley(self, request):
        pk = request.query_params.get("pk", None)
        if not pk:
            return Response({"error": "Debes enviar ?pk=<id_ley>"}, status=status.HTTP_400_BAD_REQUEST)

        # Obtener la ley principal
        try:
            ley = Ley.objects.get(pk=pk)
        except Ley.DoesNotExist:
            return Response({"error": "Ley no encontrada"}, status=status.HTTP_404_NOT_FOUND)

        # Convertir el embedding de la ley a string tipo array Postgres
        embedding_actual = "[" + ",".join(str(x) for x in ley.embedding) + "]"

        # Buscar leyes relacionadas por similitud semántica
        relacionadas = (
            Ley.objects.exclude(pk=ley.pk)  # excluir la ley actual
                      .exclude(embedding=None)
                      .annotate(
                          distance=RawSQL("embedding <-> %s", (embedding_actual,))
                      )
                      .order_by("distance")[:5]  # top 5
        )

        # Serializar ley principal
        ley_serializada = LeySerializer(ley).data

        # Serializar relacionadas
        relacionadas_serializadas = LeySerializer(relacionadas, many=True).data

        # Agregar al response
        resultado = {
            "ley": ley_serializada,
            "relacionadas": relacionadas_serializadas
        }

        return Response(resultado)
    
    @action(detail=False, methods=['post'])
    def semantic(self, request):
        reqUrl = "https://comedatos.qroo.gob.mx/api/NucleoDigital"

        headersList = {
        "Accept": "*/*",
        "Content-Type": "application/json",
        "Authorization": "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI0IiwianRpIjoiMmI0YjYxODg1Y2JlNzlmNzRhMGRhMmI5ZDc5MGZjMjkyMmI0MDlhNTc3NWFkMGUyNjc2YTVmMmI4Mjc2NjgzZWYyOWYxMTEyZjgzNTZmZDIiLCJpYXQiOjE3NjM4NjU5MTEuMTc5NzA2LCJuYmYiOjE3NjM4NjU5MTEuMTc5NzA4LCJleHAiOjE3OTU0MDE5MTAuOTY1MDczLCJzdWIiOiI4MSIsInNjb3BlcyI6W119.SLfNGDfaMCMqqw8jSMmUIpqDml-RbEdIIxi9qvOo5uj1DdSRitGuto93rqulafg4xzvwcuPMRAoikByQIBoixqMitkBjIOvSPQKHKr0DwNqvACbAG5DkDkwkOccH2mq4XCDes9gf_8I9UTHBeJpHfBcBq_CjBoAV25Hx9fm6PaN3luWHmS-Bp9L1tUsImk4DBiRFcvSj7ArfdoL3sUyyIgMh4i1p7tWw6HTB-03aeq3GSqEbkvb3BTSNKw1Lls8oOC4N2KtNMk4p3qmHUbEcf5hs5moumJJClm_fIJ1WZBrUtTznHeLEXb08jArorunZkQXrVhBKr-mjwzK5CX6dOfj_EwDsUZtqL_Odn18igeMktxIuLpjcAh8Dvb7EmGSbY1rq8yT0rUU6nqE1oVjMaDlqOJIPUZhy0kJd_ercOPLpkX8k-OCxLHpG4-30-qmZzY2hcOGjwySCbOzp5dyxUuaVasCw_PzvxZmDHgZfcofjxtN169v16yj8Zu9qORGMFsy-ZqViExP651igI98OgFvQgY2V51JVa46b6Go5iyAqLU0C7F9fcYouaQFNO09pV5QmWvWiaAsQmnA9C4Ir0cxAFwDKEM3irVZRCNdI-ebAlcWR_74WwUSQIRbfD60slA25omyLeWZsiyN3rdiTg-ZdOaW3t6VLSd-9tiQw6i4" 
        }

        payload = json.dumps({
        "email": "espinosasaul85@gmail.com",
        "password": "Slimeguy$1"
        })

        response = requests.request("POST", reqUrl, data=payload,  headers=headersList)
        api_data = response.json()
        leys_api = [l for l in api_data["datosTablas"]["h25_normatividad"]]
        print(f"Resultado de la api: {api_data}")
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

        if len(preguntas_parecidas) > 0 and (historial_mensajes is None or historial_mensajes == []):
            print("hay una prehunta parecida")
            pregunta_parecida = preguntas_parecidas[0]
            pregunta = PreguntaSerializer(data={"pregunta": query, "leyes": pregunta_parecida["leyes"], "mensajes": [], "resumen": pregunta_parecida["resumen"], "embedding": pregunta_parecida["embedding"]})
            leyes = Ley.objects.filter(id__in=pregunta_parecida["leyes"])
            leyes_serial = LeySerializer(leyes, many=True).data
            texto = ""
            for ley in leyes:
                resumen = ""
                # normalize titles to lowercase
                ley_api = [l for l in leys_api if l["titulo"].lower().replace(".", "") == ley.titulo.lower().replace(".", "")]
                if len(ley_api) > 0:
                    print(f"ley api encontrada para {ley.titulo}")
                    resumen = ley_api[0]["descripcion"]
                    ley.resumen = resumen
                texto += f"Título: {ley.titulo}\n"
                texto += f"Temas: {', '.join([t.tema for t in ley.tema.all()])}\n"
                texto += f"Contenido:\n{resumen}\n\n"
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
        else:
            print("no hay una pregunta parecida o es un chat")
            # 2. Usar RawSQL para invocar el operador de pgvector (<-> = distancia euclidiana)
            leyes = Ley.objects.exclude(embedding=None).annotate(
                distance=RawSQL("embedding <-> %s", (query_emb,))
            ).order_by("distance")[:5]

            # 3) Construir texto combinado
            texto = ""
            for ley in leyes:
                resumen = ""
                # normalize titles to lowercase
                ley_api = [l for l in leys_api if l["titulo"].lower().replace(".", "") == ley.titulo.lower().replace(".", "")]
                if len(ley_api) > 0:
                    resumen = ley_api[0]["descripcion"]
                else:
                    resumen = ley.resumen
                texto += f"Título: {ley.titulo}\n"
                texto += f"Temas: {', '.join([t.tema for t in ley.tema.all()])}\n"
                texto += f"Resumen:\n{resumen}\n\n"
                texto += f"Consulta: {query}\n"

            # 4) Llamar a Ollama local para un resumen
            prompt = f"""
            Guarda el contexto de los resumenes de las siguientes leyes y genera un resumen claro y conciso del siguiente texto legal usando un lenguaje coloquial y de forma entendible para una persona común sin conocimientos en leyes.
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

        return Response({
            "query": query,
            "query_emb": query_emb,
            "resumen": resumen,
            "resultados": leyes_serial,
            "historial_mensajes": historial_mensajes
        })