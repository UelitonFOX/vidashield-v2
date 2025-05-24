"""
Utilitários e funções auxiliares para manipulação de UUIDs.
"""

import uuid
from werkzeug.exceptions import BadRequest


def validate_uuid(uuid_string):
    """
    Valida se uma string é um UUID válido.
    Retorna o objeto UUID se for válido, ou lança BadRequest se inválido.

    Args:
        uuid_string (str): String a ser validada como UUID

    Returns:
        uuid.UUID: Objeto UUID validado

    Raises:
        BadRequest: Se a string não for um UUID válido
    """
    try:
        return uuid.UUID(str(uuid_string))
    except (ValueError, AttributeError, TypeError):
        raise BadRequest(f"Invalid UUID format: {uuid_string}")


def is_valid_uuid(uuid_string):
    """
    Verifica se uma string é um UUID válido sem lançar exceções.

    Args:
        uuid_string (str): String a ser validada

    Returns:
        bool: True se for um UUID válido, False caso contrário
    """
    try:
        uuid.UUID(str(uuid_string))
        return True
    except (ValueError, AttributeError, TypeError):
        return False


def str_to_uuid(uuid_string):
    """
    Converte uma string para UUID, retornando None se inválido.

    Args:
        uuid_string (str): String a ser convertida

    Returns:
        uuid.UUID: Objeto UUID ou None se inválido
    """
    try:
        return uuid.UUID(str(uuid_string))
    except (ValueError, AttributeError, TypeError):
        return None
