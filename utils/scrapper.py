import requests

url_congreso = "https://www.congresoqroo.gob.mx/api/v2/leyes/?format=json"
url_mi_api = "http://ley-al-alcance.duckdns.org/api/leyes/"

resp = requests.get(url_congreso)
for ley in resp.json()['results']:
    r = requests.post(url_mi_api, json=ley)
    if r.status_code in (200, 201):
        print(f"Ley {ley['titulo']} agregada")
    else:
        print(f"Error con {ley['titulo']}: {r.text}")
