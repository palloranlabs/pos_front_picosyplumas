import api from './client';

export const updateMasterPassword = async (newMasterPassword: string): Promise<void> => {
    await api.post('/api/v1/config/master-password', {
        new_master_password: newMasterPassword
    });
};
