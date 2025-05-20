import api from '../api';

const userProfileService = {
  /**
   * Atualiza a foto de perfil do usuário
   * @param photoData Base64 da imagem a ser usada como foto de perfil
   */
  updateProfilePhoto: async (photoData: string) => {
    const response = await api.post('/users/profile/photo', { photo: photoData });
    return response.data;
  }
};

export default userProfileService; 