import bcrypt

senha = "admin123".encode("utf-8")
hash = bcrypt.hashpw(senha, bcrypt.gensalt())
print(hash.decode())
