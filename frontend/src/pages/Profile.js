// src/pages/Profile.js
import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { useTheme } from '../contexts/ThemeContext';
import {
  FiUser, FiMail, FiCalendar, FiEdit2, FiSave, FiUserCheck,
  FiTrendingUp, FiClock, FiAward, FiCamera, FiX,
  FiAlertCircle, FiCheckCircle
} from 'react-icons/fi';

const Profile = ({ user, updateUser }) => {
  const { t } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState(user?.username || '');
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [email] = useState(user?.email || '');
  const [photo, setPhoto] = useState(user?.photo || null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const fileInputRef = useRef(null);

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result;
      setPhoto(base64);
      updateUser({ photo: base64 });
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setPhoto(null);
    updateUser({ photo: null });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          username: username,
          full_name: fullName
        })
      });

      const data = await res.json();
      if (res.ok) {
        updateUser(data.user);
        setMessage({ type: 'success', text: t('profile.save.success') });
        setIsEditing(false);
      } else {
        setMessage({ type: 'error', text: data.error || t('profile.save.error') });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Erro de conexão com o servidor' });
    } finally {
      setLoading(false);
    }
  };

  const memberSince = user?.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }) : 'Janeiro 2026';
  const firstLetter = username.charAt(0).toUpperCase();

  return (
    <StyledWrapper>
      <Container>
        <HeaderSection>
          <AvatarWrapper>
            <Avatar>{photo ? <AvatarImage src={photo} alt={username} /> : firstLetter}</Avatar>
            <CameraButton onClick={() => fileInputRef.current.click()}><FiCamera size={16} /></CameraButton>
            <HiddenInput ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} />
            {photo && <RemovePhotoButton onClick={handleRemovePhoto}><FiX size={14} /></RemovePhotoButton>}
          </AvatarWrapper>
          <UserInfo>
            <Name>{username}</Name>
            <Role>{fullName || 'Usuário'}</Role>
            <MemberSince><FiCalendar size={14} /> {t('profile.member')} {memberSince}</MemberSince>
          </UserInfo>
          <EditButton onClick={() => setIsEditing(!isEditing)}>
            {isEditing ? <FiSave size={18} /> : <FiEdit2 size={18} />}
            {isEditing ? ` ${t('profile.save')}` : ` ${t('profile.edit')}`}
          </EditButton>
        </HeaderSection>

        <ProfileCard>
          <CardTitle>{t('profile.title')}</CardTitle>
          <InfoRow>
            <InfoLabel><FiUser /> {t('profile.username')}</InfoLabel>
            {isEditing ? (
              <Input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Nome de usuário" />
            ) : (
              <InfoValue>{username}</InfoValue>
            )}
          </InfoRow>
          <InfoRow>
            <InfoLabel><FiUser /> {t('profile.fullname')}</InfoLabel>
            {isEditing ? (
              <Input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Nome completo" />
            ) : (
              <InfoValue>{fullName || 'Não informado'}</InfoValue>
            )}
          </InfoRow>
          <InfoRow>
            <InfoLabel><FiMail /> {t('profile.email')}</InfoLabel>
            <InfoValue>{email}</InfoValue>
          </InfoRow>
          {message.text && (
            <Message type={message.type}>
              {message.type === 'success' ? <FiCheckCircle /> : <FiAlertCircle />}
              {message.text}
            </Message>
          )}
          {isEditing && (
            <SaveButton onClick={handleSave} disabled={loading}>
              <FiSave /> {loading ? 'Salvando...' : t('profile.save')}
            </SaveButton>
          )}
        </ProfileCard>

        <StatsGrid>
          <StatCard>
            <StatIcon><FiUserCheck /></StatIcon>
            <StatNumber>12</StatNumber>
            <StatLabel>{t('profile.favorites')}</StatLabel>
          </StatCard>
          <StatCard>
            <StatIcon><FiTrendingUp /></StatIcon>
            <StatNumber>45</StatNumber>
            <StatLabel>{t('profile.queries')}</StatLabel>
          </StatCard>
          <StatCard>
            <StatIcon><FiClock /></StatIcon>
            <StatNumber>3h</StatNumber>
            <StatLabel>{t('profile.time')}</StatLabel>
          </StatCard>
          <StatCard>
            <StatIcon><FiAward /></StatIcon>
            <StatNumber>7</StatNumber>
            <StatLabel>{t('profile.achievements')}</StatLabel>
          </StatCard>
        </StatsGrid>
      </Container>
    </StyledWrapper>
  );
};

// ========== STYLED COMPONENTS ==========
const StyledWrapper = styled.div`
  font-family: 'Inter', sans-serif;
  background: ${({ theme }) => theme.background || '#f8fafc'};
  min-height: calc(100vh - 70px);
  padding: 2rem;
  padding-top: calc(70px + 2rem);
`;

const Container = styled.div`
  max-width: 900px;
  margin: 0 auto;
`;

const HeaderSection = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
  background: ${({ theme }) => theme.cardBackground || '#ffffff'};
  padding: 2rem;
  border-radius: 24px;
  box-shadow: ${({ theme }) => theme.shadow || '0 4px 12px rgba(0,0,0,0.02)'};
  margin-bottom: 2rem;
  flex-wrap: wrap;
  @media (max-width: 640px) {
    flex-direction: column;
    text-align: center;
    justify-content: center;
  }
`;

const AvatarWrapper = styled.div`
  position: relative;
  flex-shrink: 0;
`;

const Avatar = styled.div`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.8rem;
  font-weight: 700;
  overflow: hidden;
`;

const AvatarImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const CameraButton = styled.button`
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: #3b82f6;
  color: white;
  border: 3px solid ${({ theme }) => theme.cardBackground || '#ffffff'};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s;
  &:hover { background: #2563eb; }
`;

const RemovePhotoButton = styled.button`
  position: absolute;
  top: 0;
  right: 2px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #ef4444;
  color: white;
  border: 2px solid ${({ theme }) => theme.cardBackground || '#ffffff'};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s;
  &:hover { background: #dc2626; }
`;

const HiddenInput = styled.input`
  display: none;
`;

const UserInfo = styled.div`
  flex: 1;
`;

const Name = styled.h2`
  font-size: 1.8rem;
  font-weight: 700;
  color: ${({ theme }) => theme.textPrimary || '#0f172a'};
  margin: 0;
`;

const Role = styled.p`
  color: #3b82f6;
  font-weight: 500;
  margin: 0.2rem 0;
`;

const MemberSince = styled.p`
  color: ${({ theme }) => theme.textSecondary || '#94a3b8'};
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  margin: 0.2rem 0;
`;

const EditButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 1.5rem;
  background: #3b82f6;
  color: #fff;
  border: none;
  border-radius: 40px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s;
  &:hover { background: #2563eb; }
`;

const ProfileCard = styled.div`
  background: ${({ theme }) => theme.cardBackground || '#ffffff'};
  padding: 2rem;
  border-radius: 24px;
  box-shadow: ${({ theme }) => theme.shadow || '0 4px 12px rgba(0,0,0,0.02)'};
  margin-bottom: 2rem;
`;

const CardTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  color: ${({ theme }) => theme.textPrimary || '#0f172a'};
  margin-bottom: 1.5rem;
`;

const InfoRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.8rem 0;
  border-bottom: 1px solid ${({ theme }) => theme.border || '#f1f5f9'};
  &:last-child { border-bottom: none; }
  @media (max-width: 640px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.3rem;
  }
`;

const InfoLabel = styled.span`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${({ theme }) => theme.textSecondary || '#64748b'};
  font-weight: 500;
`;

const InfoValue = styled.span`
  color: ${({ theme }) => theme.textPrimary || '#0f172a'};
  font-weight: 500;
`;

const Input = styled.input`
  padding: 0.4rem 0.8rem;
  border: 2px solid ${({ theme }) => theme.border || '#e2e8f0'};
  border-radius: 8px;
  font-size: 1rem;
  background: ${({ theme }) => theme.inputBackground || '#ffffff'};
  color: ${({ theme }) => theme.textPrimary || '#0f172a'};
  outline: none;
  width: 60%;
  &:focus { border-color: #3b82f6; }
  @media (max-width: 640px) { width: 100%; }
`;

const Message = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.8rem 1rem;
  border-radius: 8px;
  margin-top: 0.5rem;
  background: ${({ type }) => type === 'success' ? '#dcfce7' : '#fee2e2'};
  color: ${({ type }) => type === 'success' ? '#166534' : '#991b1b'};
  font-size: 0.9rem;
`;

const SaveButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.8rem;
  background: #22c55e;
  color: #fff;
  border: none;
  border-radius: 40px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  margin-top: 1rem;
  transition: background 0.3s;
  &:hover:not(:disabled) { background: #16a34a; }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1.5rem;
`;

const StatCard = styled.div`
  background: ${({ theme }) => theme.cardBackground || '#ffffff'};
  padding: 1.5rem;
  border-radius: 20px;
  text-align: center;
  box-shadow: ${({ theme }) => theme.shadow || '0 4px 12px rgba(0,0,0,0.02)'};
`;

const StatIcon = styled.div`
  font-size: 2rem;
  color: #3b82f6;
  margin-bottom: 0.4rem;
  display: flex;
  justify-content: center;
`;

const StatNumber = styled.div`
  font-size: 1.8rem;
  font-weight: 700;
  color: ${({ theme }) => theme.textPrimary || '#0f172a'};
`;

const StatLabel = styled.div`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.textSecondary || '#64748b'};
`;

export default Profile;