import streamlit as st
from logger import log_event
import random

def show_sensor_controls():
    """
    Botões para simular alertas de sensores de segurança.
    """
    st.subheader("Simulação de Sensores")
    st.write("Clique para simular eventos de segurança.")

    if st.button("Simular Alerta de Intrusão"):
        event = random.choice([
            "Movimentação suspeita detectada na recepção.",
            "Tentativa de acesso forçado à sala de prontuários.",
            "Evento de intrusão no consultório 2."
        ])
        log_event(event)
        st.warning(f"Simulação registrada: {event}")
