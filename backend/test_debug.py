"""
Script de teste para diagnóstico da rota de alertas.
"""

import requests
import json

def test_diagnostico():
    """Testar rota de diagnóstico de alertas"""
    url = "http://localhost:5000/api/alerts/diagnostico"
    
    print(f"Fazendo requisição para {url}")
    response = requests.get(url)
    
    print(f"Status code: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(json.dumps(data, indent=2))
    else:
        print(f"Erro: {response.text}")

if __name__ == "__main__":
    test_diagnostico() 