from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, User
import random
from datetime import datetime, timedelta
import os
# import string# import secrets
import base64
import uuid

users_bp = Blueprint('users', __name__)

# Lista de usuários dummy para desenvolvimento
dummy_users = [
    {
        "id": 1,
        "name": "Admin do Sistema",
        "email": "admin@vidashield.com",
        "status": "active",
        "lastLogin": "Hoje, 10:25",
        "role": "admin"
    },
    {
        "id": 2,
        "name": "Maria Silva",
        "email": "maria@exemplo.com",
        "status": "active",
        "lastLogin": "Ontem, 15:42",
        "role": "manager"
    },
    {
        "id": 3,
        "name": "João Santos",
        "email": "joao@exemplo.com",
        "status": "active",
        "lastLogin": "21/04/2025, 08:10",
        "role": "user"
    },
    {
        "id": 4,
        "name": "Ana Oliveira",
        "email": "ana@exemplo.com",
        "status": "inactive",
        "lastLogin": "05/03/2025, 14:30",
        "role": "user"
    },
    {
        "id": 5,
        "name": "Carlos Ferreira",
        "email": "carlos@exemplo.com",
        "status": "active",
        "lastLogin": "Hoje, 09:15",
        "role": "user"
    }
]

# Função para gerar mais usuários dummy


def generate_more_users(count=15):
    names = [
        "Pedro",
        "Julia",
        "Rafael",
        "Camila",
        "Lucas",
        "Amanda",
        "Fernando",
        "Larissa",
        "Gabriel",
        "Bianca",
        "Roberto",
        "Carla",
        "Rodrigo",
        "Patrícia",
        "Marcos"]
    surnames = [
        "Lima",
        "Costa",
        "Pereira",
        "Almeida",
        "Souza",
        "Oliveira",
        "Rodrigues",
        "Ferreira",
        "Santos",
        "Ribeiro",
        "Gomes",
        "Carvalho",
        "Martins",
        "Silva"]
    domains = [
        "gmail.com",
        "outlook.com",
        "hotmail.com",
        "empresa.com.br",
        "medico.com.br"]
    roles = ["user", "user", "user", "manager", "user"]
    statuses = ["active", "active", "active", "active", "inactive"]

    current_ids = [user["id"] for user in dummy_users]
    max_id = max(current_ids) if current_ids else 0

    generated_users = []
    for i in range(count):
        user_id = max_id + i + 1
        name = random.choice(names)
        surname = random.choice(surnames)
        full_name = f"{name} {surname}"
        email = f"{name.lower()}.{surname.lower()}@{random.choice(domains)}"

        # Gerar data de último login
        days_ago = random.randint(0, 30)
        if days_ago == 0:
            last_login = "Hoje, " + \
                f"{random.randint(8, 21)}:{random.randint(0, 59):02d}"
        elif days_ago == 1:
            last_login = "Ontem, " + \
                f"{random.randint(8, 21)}:{random.randint(0, 59):02d}"
        else:
            date = datetime.now() - timedelta(days=days_ago)
            last_login = date.strftime("%d/%m/%Y, %H:%M")

        generated_users.append({
            "id": user_id,
            "name": full_name,
            "email": email,
            "status": random.choice(statuses),
            "lastLogin": last_login,
            "role": random.choice(roles)
        })

    return generated_users


# Adicionar mais usuários à lista inicial
dummy_users.extend(generate_more_users())


@users_bp.route('', methods=['GET'])
@jwt_required()
def get_users():
    # Verificar se o usuário atual é administrador
    # Em uma implementação real, você verificaria a permissão do usuário

    # Parâmetros de paginação e filtro
    page = request.args.get('page', 1, type=int)
    limit = request.args.get('limit', 10, type=int)
    search = request.args.get('search', '', type=str).lower()
    status_filter = request.args.get('status', '')
    role_filter = request.args.get('role', '')

    # Filtrar usuários
    filtered_users = dummy_users.copy()

    # Aplicar filtro de busca (nome ou email)
    if search:
        filtered_users = [user for user in filtered_users if
                          search in user['name'].lower() or
                          search in user['email'].lower()]

    # Aplicar filtro de status
    if status_filter and status_filter != 'all':
        filtered_users = [user for user in filtered_users if
                          user['status'] == status_filter]

    # Aplicar filtro de função
    if role_filter and role_filter != 'all':
        filtered_users = [user for user in filtered_users if
                          user['role'] == role_filter]

    # Calcular paginação
    total = len(filtered_users)
    start_idx = (page - 1) * limit
    end_idx = min(start_idx + limit, total)
    paginated_users = filtered_users[start_idx:end_idx]

    return jsonify({
        "users": paginated_users,
        "total": total,
        "page": page,
        "pages": (total + limit - 1) // limit
    })


@users_bp.route('/<int:user_id>/reset-password', methods=['POST'])
@jwt_required()
def reset_password(user_id):
    # Verificar se o usuário existe
    user = next((u for u in dummy_users if u['id'] == user_id), None)
    if not user:
        return jsonify({"error": "Usuário não encontrado"}), 404

    # Em uma implementação real, aqui você geraria uma senha aleatória,
        # atualizaria no banco de dados e enviaria por email    # Simular geração de senha aleatória    # new_password = ''.join(    #     secrets.choice(    #         string.ascii_letters +    #         string.digits) for _ in range(10))    # Aqui você atualizaria o hash da senha no banco
    # user.password_hash = generate_password_hash(new_password)
    # db.session.commit()

    # Aqui você enviaria o email com a nova senha
    # Mas para desenvolvimento, apenas retornamos sucesso

    return jsonify({
        "message": "Senha resetada com sucesso. Um email foi enviado ao usuário."
    })


@users_bp.route('/<int:user_id>/promote', methods=['PUT'])
@jwt_required()
def promote_user(user_id):
    # Verificar se o usuário existe na lista dummy
    user = next((u for u in dummy_users if u['id'] == user_id), None)
    if not user:
        return jsonify({"error": "Usuário não encontrado"}), 404

    # Promover usuário para administrador
    user['role'] = 'admin'

    return jsonify({
        "message": "Usuário promovido a administrador com sucesso.",
        "user": user
    })


@users_bp.route('/<int:user_id>/status', methods=['PUT'])
@jwt_required()
def update_status(user_id):
    # Verificar se o usuário existe na lista dummy
    user = next((u for u in dummy_users if u['id'] == user_id), None)
    if not user:
        return jsonify({"error": "Usuário não encontrado"}), 404

    # Obter o novo status do corpo da requisição
    data = request.get_json()
    new_status = data.get('status')

    if not new_status or new_status not in ['active', 'inactive']:
        return jsonify(
            {"error": "Status inválido. Deve ser 'active' ou 'inactive'."}), 400

    # Atualizar o status do usuário
    user['status'] = new_status

    return jsonify({"message": f"Status do usuário atualizado para '{
                   new_status}' com sucesso.", "user": user})


@users_bp.route('', methods=['POST'])
@jwt_required()
def create_user():
    # Obter dados do corpo da requisição
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    role = data.get('role', 'user')

    if not name or not email:
        return jsonify({"error": "Nome e email são obrigatórios"}), 400

    if role not in ['admin', 'manager', 'user']:
        return jsonify(
            {"error": "Função inválida. Deve ser 'admin', 'manager' ou 'user'."}), 400

    # Verificar se o email já existe
    if any(u['email'] == email for u in dummy_users):
        return jsonify({"error": "Email já cadastrado"}), 400

    # Criar novo usuário
    new_user = {
        "id": max(u['id'] for u in dummy_users) + 1,
        "name": name,
        "email": email,
        "status": "active",
        "lastLogin": "Nunca",
        "role": role
    }

    dummy_users.append(new_user)

    return jsonify({
        "message": "Usuário criado com sucesso.",
        "user": new_user
    }), 201


@users_bp.route('/<int:user_id>', methods=['PUT'])
@jwt_required()
def update_user(user_id):
    # Verificar se o usuário existe
    user = next((u for u in dummy_users if u['id'] == user_id), None)
    if not user:
        return jsonify({"error": "Usuário não encontrado"}), 404

    # Obter dados do corpo da requisição
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    role = data.get('role')

    # Atualizar apenas os campos fornecidos
    if name:
        user['name'] = name

    if email:
        # Verificar se o email já existe em outro usuário
        if email != user['email'] and any(
                u['email'] == email and u['id'] != user_id for u in dummy_users):
            return jsonify(
                {"error": "Email já cadastrado para outro usuário"}), 400
        user['email'] = email

    if role and role in ['admin', 'manager', 'user']:
        user['role'] = role

    return jsonify({
        "message": "Usuário atualizado com sucesso.",
        "user": user
    })

# Rota para upload de foto de perfil


@users_bp.route('/profile/photo', methods=['POST'])
@jwt_required()
def upload_profile_photo():
    try:
        # Obter o ID do usuário a partir do token JWT
        user_id = get_jwt_identity()

        # Verificar se o usuário existe
        user = None
        try:
            user = User.query.filter_by(id=user_id).first()
        except Exception as e:
            print(f"Erro ao buscar usuário: {str(e)}")
            try:
                # Consulta SQL direta (caso a coluna avatar_url esteja causando
                # problemas)
                result = db.session.execute(
                    "SELECT id FROM \"user\" WHERE id = :user_id",
                    {"user_id": user_id}
                ).fetchone()

                if result:
                    user_id = result[0]
            except Exception as query_error:
                print(f"Erro na consulta SQL direta: {str(query_error)}")
                return jsonify({"msg": "Erro ao verificar usuário"}), 500

        if not user and not user_id:
            return jsonify({"msg": "Usuário não encontrado"}), 404

        # Obter os dados da imagem do corpo da requisição
        data = request.get_json()
        photo_data = data.get('photo')

        if not photo_data:
            return jsonify({"msg": "Dados da foto não fornecidos"}), 400

        # Verificar se os dados começam com data:image
        if not photo_data.startswith('data:image'):
            return jsonify({"msg": "Formato de imagem inválido"}), 400

        # Extrair tipo e dados da imagem base64
        try:
            # Formato esperado: data:image/jpeg;base64,/9j/4AAQSkZJRg...
            image_format = photo_data.split(';')[0].split('/')[1]
            encoded_image = photo_data.split(',')[1]

            # Verificar se o tamanho da imagem é razoável (máximo 5MB)
            decoded_size = len(base64.b64decode(encoded_image))
            if decoded_size > 5 * 1024 * 1024:  # 5MB
                return jsonify(
                    {"msg": "Tamanho da imagem excede o limite de 5MB"}), 400

            # Gerar um nome de arquivo único
            filename = f"{uuid.uuid4()}.{image_format}"

            # Criar diretório para imagens se não existir
            upload_dir = os.path.join(
                os.path.dirname(
                    os.path.dirname(__file__)),
                'static',
                'uploads',
                'profile_photos')
            os.makedirs(upload_dir, exist_ok=True)

            # Caminho completo do arquivo
            file_path = os.path.join(upload_dir, filename)

            # Salvar a imagem no servidor
            with open(file_path, "wb") as f:
                f.write(base64.b64decode(encoded_image))

            # URL da imagem para acesso
            photo_url = f"/static/uploads/profile_photos/{filename}"

            # Atualizar a URL da foto no banco de dados
            try:
                # Tentar a abordagem ORM normal
                if user:
                    user.avatar_url = photo_url
                    db.session.commit()
                else:
                    # Usar SQL direto se o ORM falhar
                    db.session.execute(
                        "UPDATE \"user\" SET avatar_url = :photo_url WHERE id = :user_id", {
                            "photo_url": photo_url, "user_id": user_id})
                    db.session.commit()

                return jsonify({
                    "msg": "Foto de perfil atualizada com sucesso",
                    "photo_url": photo_url
                })

            except Exception as db_error:
                print(
                    f"Erro ao atualizar foto no banco de dados: {
                        str(db_error)}")
                db.session.rollback()
                # Se falhar ao salvar no banco, remover o arquivo
                if os.path.exists(file_path):
                    os.remove(file_path)
                return jsonify(
                    {"msg": "Erro ao atualizar foto no banco de dados"}), 500

        except Exception as process_error:
            print(f"Erro ao processar imagem: {str(process_error)}")
            return jsonify({"msg": "Erro ao processar imagem"}), 500

    except Exception as e:
        print(f"Erro no upload de foto: {str(e)}")
        return jsonify({"msg": "Erro no servidor ao processar upload"}), 500
