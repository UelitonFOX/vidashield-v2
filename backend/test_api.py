import requests
import json

def test_ping():
    try:
        response = requests.get('http://localhost:5000/ping')
        print(f"Ping Status: {response.status_code}")
        print(f"Ping Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"Erro no ping: {str(e)}")
        return False

def test_login():
    try:
        response = requests.post(
            'http://localhost:5000/api/auth/login',
            json={
                'email': 'test@example.com',
                'password': 'password'
            }
        )
        print(f"Login Status: {response.status_code}")
        print(f"Login Response: {response.json()}")
        token = response.json().get('access_token')
        if token:
            print(f"Token recebido: {token[:15]}...")
            return token
        return None
    except Exception as e:
        print(f"Erro no login: {str(e)}")
        return None

def test_me(token):
    if not token:
        print("Sem token, pulando teste /me")
        return False
    
    try:
        response = requests.get(
            'http://localhost:5000/api/auth/me',
            headers={'Authorization': f'Bearer {token}'}
        )
        print(f"Me Status: {response.status_code}")
        print(f"Me Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"Erro no /me: {str(e)}")
        return False

def test_google_oauth():
    try:
        response = requests.get('http://localhost:5000/api/auth/google', allow_redirects=False)
        print(f"Google OAuth Status: {response.status_code}")
        print(f"Google OAuth Location: {response.headers.get('Location')}")
        return True
    except Exception as e:
        print(f"Erro no Google OAuth: {str(e)}")
        return False

if __name__ == "__main__":
    print("\n=== Teste de API ===\n")
    
    if test_ping():
        print("\n✅ Ping funcionando corretamente")
    else:
        print("\n❌ Ping falhou")
    
    token = test_login()
    if token:
        print("\n✅ Login funcionando corretamente")
    else:
        print("\n❌ Login falhou")
    
    if test_me(token):
        print("\n✅ Validação de token funcionando corretamente")
    else:
        print("\n❌ Validação de token falhou")
    
    if test_google_oauth():
        print("\n✅ OAuth Google funcionando corretamente")
    else:
        print("\n❌ OAuth Google falhou")
    
    print("\n=== Fim dos testes ===\n") 