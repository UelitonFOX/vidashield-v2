import streamlit as st
from PIL import Image
from app.auth import login_user, is_authenticated
from app.dashboard import show_dashboard
from app.sensors import show_sensor_controls
from app.logger import log_event
from config.settings import get_secret_key
import os

def main():
    st.set_page_config(page_title="VidaShield", layout="centered")

    # Caminho da logo
    logo_path = os.path.join("assets", "logo_login.png")

    # Centralizar logo + nome
    st.markdown("<div style='text-align: center;'>", unsafe_allow_html=True)
    col1, col2, col3 = st.columns([1, 0.05, 4])
    with col1:
        try:
            logo = Image.open(logo_path)
            st.image(logo, width=60)
        except:
            st.write("🛡️")

    with col2:
        st.write("")

    with col3:
        st.markdown("<h1 style='margin: 0px; padding-top: 10px;'>VidaShield</h1>", unsafe_allow_html=True)
    st.markdown("</div>", unsafe_allow_html=True)

    # Controle de sessão
    if "logged_in" not in st.session_state:
        st.session_state.logged_in = False

    # Tela de login
    if not st.session_state.logged_in:
        st.subheader("Login")
        user = st.text_input("Usuário", value="", key="user")
        password = st.text_input("Senha", type="password", key="password")

        if st.button("Entrar"):
            if login_user(user, password):
                st.session_state.logged_in = True
                log_event(f"Usuário '{user}' autenticado com sucesso.")
                st.rerun()
            else:
                st.error("Credenciais inválidas.")
                log_event(f"Tentativa de login falhou para o usuário '{user}'.")
    else:
        st.title("VidaShield - Dashboard")
        show_dashboard()
        show_sensor_controls()

        if st.button("Sair"):
            st.session_state.logged_in = False
            st.rerun()

def run():
    secret_key = get_secret_key()
    main()

if __name__ == "__main__":
    run()
