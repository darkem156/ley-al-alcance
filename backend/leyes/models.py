from django.db import models
from pgvector.django import VectorField

class Tema(models.Model):
    tema = models.CharField(max_length=255)
    external_id = models.IntegerField(null=True, blank=True, unique=True)  # ID de la API

    def __str__(self):
        return self.tema


class Decreto(models.Model):
    numero = models.IntegerField()
    external_id = models.IntegerField(null=True, blank=True, unique=True)  # ID de la API

    def __str__(self):
        return f"Decreto {self.numero}"


class Ley(models.Model):
    id = models.IntegerField(primary_key=True)
    titulo = models.CharField(max_length=500)
    abrogada = models.BooleanField(default=False)
    comentario = models.TextField(blank=True, null=True)
    tema = models.ManyToManyField(Tema, related_name='leyes')
    contenido_pdf = models.TextField(blank=True)
    embedding = VectorField(dimensions=1024, null=True)
    resumen = models.TextField(blank=True)

    def __str__(self):
        return self.titulo


class Historial(models.Model):
    id = models.IntegerField(primary_key=True)
    ley = models.ForeignKey(Ley, on_delete=models.CASCADE, related_name='historial')
    fecha_ppo = models.DateField()
    rutaArchivo = models.URLField()
    comentario = models.TextField(blank=True, null=True)
    estatus = models.BooleanField(default=False)
    activo = models.BooleanField(default=True)
    decretos = models.ManyToManyField(Decreto, blank=True)

    def __str__(self):
        return f"Historial de {self.ley.titulo} ({self.fecha_ppo})"

class Pregunta(models.Model):
    id = models.AutoField(primary_key=True)
    pregunta = models.TextField()
    leyes = models.JSONField()
    resumen = models.TextField()
    embedding = VectorField(dimensions=1024, null=True)
    fecha = models.DateField(auto_now_add=True)