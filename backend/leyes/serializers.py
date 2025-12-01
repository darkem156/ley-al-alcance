from rest_framework import serializers
from .models import Ley, Tema, Historial, Decreto, Pregunta
import pytesseract
from sentence_transformers import SentenceTransformer
import requests
import tempfile
from pdf2image import convert_from_path
from ollama import Client
from langdetect import detect

ollama = Client()

model_emb = SentenceTransformer("BAAI/bge-m3")

def extraer_texto_pdf(url):
    pdf_data = requests.get(url).content

    with tempfile.NamedTemporaryFile(suffix=".pdf") as tmp:
        tmp.write(pdf_data)
        tmp.flush()

        pages = convert_from_path(tmp.name)

        texto = ""
        for page in pages:
            texto += pytesseract.image_to_string(page, lang="spa") + "\n"

        return texto


class DecretoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Decreto
        fields = ['id', 'numero', 'external_id']  # external_id opcional

class HistorialSerializer(serializers.ModelSerializer):
    decretos = DecretoSerializer(many=True)
    rutaArchivo = serializers.CharField()

    class Meta:
        model = Historial
        fields = ['id', 'fecha_ppo', 'rutaArchivo', 'comentario', 'estatus', 'activo', 'decretos']

class TemaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tema
        fields = ['id', 'tema']

class PreguntaSerializer(serializers.ModelSerializer):
    distance = serializers.FloatField(read_only=True)
    class Meta:
        model = Pregunta
        fields = '__all__'

    def create(self, validated_data):
        pregunta = Pregunta.objects.create(**validated_data)

        pregunta.save()
        return pregunta

class LeySerializer(serializers.ModelSerializer):
    tema = TemaSerializer(many=True)
    historial = HistorialSerializer(many=True)
    distance = serializers.FloatField(read_only=True)

    class Meta:
        model = Ley
        fields = '__all__'

    def create(self, validated_data):
        tema_data = validated_data.pop('tema', [])
        historial_data = validated_data.pop('historial', [])

        ley = Ley.objects.create(**validated_data)

        for tema_item in tema_data:
            external_id = tema_item.get('id')
            nombre = tema_item.get('tema')

            if external_id:
                tema_obj, _ = Tema.objects.get_or_create(
                    external_id=external_id,
                    defaults={'tema': nombre}
                )
            else:
                tema_obj, _ = Tema.objects.get_or_create(tema=nombre)

            ley.tema.add(tema_obj)

        historiales_creados = []
        for hist_item in historial_data:
            decretos_data = hist_item.pop('decretos', [])
            historial = Historial.objects.create(ley=ley, **hist_item)
            historiales_creados.append(historial)

            for dec_item in decretos_data:
                dec_external_id = dec_item.get('id')
                numero = dec_item.get('numero')

                if dec_external_id:
                    decreto, _ = Decreto.objects.get_or_create(
                        external_id=dec_external_id,
                        defaults={'numero': numero}
                    )
                else:
                    decreto, _ = Decreto.objects.get_or_create(numero=numero)

                historial.decretos.add(decreto)
        
        mas_reciente = sorted(historiales_creados, key=lambda x: x.fecha_ppo, reverse=True)[0]
        print(mas_reciente.rutaArchivo)
        texto = extraer_texto_pdf(mas_reciente.rutaArchivo)
        print("Texto extraído:", texto[:500])  # Muestra los primeros 500 caracteres del texto extraído
        ley.contenido_pdf = texto
        ley.embedding = model_emb.encode(texto, normalize_embeddings=True).tolist()
        # generar resumen de el documento
        prompt = f"""
        Genera un resumen claro y conciso del siguiente texto legal usando un lenguaje coloquial y de forma entendible para una persona común sin conocimientos en leyes.
        {texto}
        """
        response = ollama.generate(
            model="llama3",
            prompt=prompt
        )
        resumen = response["response"].strip()
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
        ley.resumen = resumen
        ley.save()

        return ley
