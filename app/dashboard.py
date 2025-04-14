import streamlit as st
from app.logger import get_recent_logs

def show_dashboard():
    """
    Painel de monitoramento com filtros de tipo e quantidade de eventos.
    """
    st.subheader("📊 Painel de Monitoramento")
    st.write("Visualize os eventos de segurança registrados no sistema.")

    # Seletor de quantidade de eventos
    limit = st.selectbox("📦 Quantos eventos deseja exibir?", [5, 10, 20, 50, 100], index=1)

    logs = get_recent_logs(limit=limit)

    if not logs:
        st.info("Nenhum log registrado ainda.")
        return

    # Filtro de tipo de evento
    filtro = st.selectbox("🔍 Filtrar eventos por tipo:", [
        "Todos",
        "Logins bem-sucedidos",
        "Tentativas de login falhas",
        "Simulações de sensores",
        "Eventos suspeitos"
    ])

    def filtrar_logs(filtro):
        if filtro == "Todos":
            return logs
        elif filtro == "Logins bem-sucedidos":
            return [log for log in logs if "autenticado com sucesso" in log[0]]
        elif filtro == "Tentativas de login falhas":
            return [log for log in logs if "falhou" in log[0]]
        elif filtro == "Simulações de sensores":
            return [log for log in logs if "simulação registrada" in log[0].lower() or "detec" in log[0].lower()]
        elif filtro == "Eventos suspeitos":
            return [log for log in logs if "falhou" in log[0] or "intrusão" in log[0].lower()]
        return []

    logs_filtrados = filtrar_logs(filtro)

    st.write(f"### {len(logs_filtrados)} evento(s) encontrado(s):")
    for event, timestamp in logs_filtrados:
        if "falhou" in event.lower() or "intrusão" in event.lower():
            color = "red"
        elif "autenticado com sucesso" in event.lower():
            color = "green"
        else:
            color = "orange"

        st.markdown(f"- `{timestamp}`: <span style='color:{color}'>{event}</span>", unsafe_allow_html=True)

