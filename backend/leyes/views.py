from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status, viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
import django_filters
from django.db.models import F
from django.db.models.expressions import RawSQL

from .models import Ley
from .serializers import LeySerializer

from sentence_transformers import SentenceTransformer

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
    def semantic(self, request):
        query = request.query_params.get("q", None)
        if not query:
            return Response({"error": "Debes enviar ?q=<texto>"}, status=400)

        # 1. Obtener embedding de la consulta (lista de floats)
        query_emb = model_emb.encode(query).tolist()

        # 2. Usar RawSQL para invocar el operador de pgvector (<-> = distancia euclidiana)
        qs = Ley.objects.exclude(embedding=None).annotate(
            distance=RawSQL("embedding <-> %s", (query_emb,))
        ).order_by("distance")[:1]

        serializer = LeySerializer(qs, many=True)
        return Response(serializer.data)