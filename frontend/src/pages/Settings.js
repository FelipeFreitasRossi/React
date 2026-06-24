// src/pages/Settings.js
import React, { useState } from 'react';
import styled from 'styled-components';
import { useTheme } from '../contexts/ThemeContext';
import {
  FiMoon, FiSun, FiBell, FiLock, FiGlobe, FiUser,
  FiRefreshCw, FiSave, FiAlertTriangle, FiCheckCircle, FiXCircle,
  FiChevronDown
} from 'react-icons/fi';

const Settings = () => {
  const {
    theme,
    toggleTheme,
    notifications,
    toggleNotifications,
    language,
    changeLanguage,
    languages,
    t,
  } = useTheme();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMessage('');
    setPasswordSuccess(false);
    if (newPassword !== confirmPassword) {
      setPasswordMessage('As senhas não coincidem');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMessage('A senha deve ter pelo menos 6 caracteres');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setPasswordSuccess(true);
        setPasswordMessage('Senha alterada com sucesso!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordMessage(data.error || 'Erro ao alterar senha');
      }
    } catch (err) {
      setPasswordMessage('Erro de conexão com o servidor');
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'CONFIRMAR') {
      alert('Digite "CONFIRMAR" para confirmar a exclusão');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/delete-account', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        alert('Conta excluída com sucesso');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
      } else {
        alert(data.error || 'Erro ao excluir conta');
      }
    } catch (err) {
      alert('Erro de conexão com o servidor');
    }
    setShowDeleteConfirm(false);
    setDeleteConfirmText('');
  };

  const sessions = [
    { id: 1, device: 'Chrome - Windows', ip: '192.168.1.100', lastActive: '2026-06-23 14:30' },
    { id: 2, device: 'Firefox - MacOS', ip: '192.168.1.101', lastActive: '2026-06-22 09:15' },
  ];

  const handleLanguageSelect = (langCode) => {
    changeLanguage(langCode);
    setLanguageDropdownOpen(false);
  };

  return (
    <StyledWrapper>
      <Container>
        <Title>{t('settings.title')}</Title>
        <Subtitle>{t('settings.subtitle')}</Subtitle>

        {/* Tema */}
        <SettingsCard>
          <CardHeader><FiSun /> <CardTitle>{t('settings.theme')}</CardTitle></CardHeader>
          <SettingRow>
            <SettingLabel>{theme === 'light' ? <FiSun /> : <FiMoon />} {t('settings.theme')}</SettingLabel>
            <ThemeButtons>
              <ThemeButton active={theme === 'light'} onClick={toggleTheme}>
                <FiSun /> {t('settings.theme.light')}
              </ThemeButton>
              <ThemeButton active={theme === 'dark'} onClick={toggleTheme}>
                <FiMoon /> {t('settings.theme.dark')}
              </ThemeButton>
            </ThemeButtons>
          </SettingRow>
        </SettingsCard>

        {/* Idioma com dropdown estilizado */}
        <SettingsCard>
          <CardHeader><FiGlobe /> <CardTitle>{t('settings.language')}</CardTitle></CardHeader>
          <SettingRow>
            <SettingLabel><FiGlobe /> {t('settings.language')}</SettingLabel>
            <LanguageSelector>
              <LanguageDisplay onClick={() => setLanguageDropdownOpen(!languageDropdownOpen)}>
                <span>
                  {languages.find(l => l.code === language)?.flag || '🌐'}
                  {' '}{languages.find(l => l.code === language)?.name || 'Português'}
                </span>
                <FiChevronDown />
              </LanguageDisplay>
              {languageDropdownOpen && (
                <LanguageDropdown>
                  {languages.map((lang) => (
                    <LanguageItem
                      key={lang.code}
                      active={language === lang.code}
                      onClick={() => handleLanguageSelect(lang.code)}
                    >
                      <span>{lang.flag}</span>
                      {lang.name}
                      {language === lang.code && <ActiveIndicator>✓</ActiveIndicator>}
                    </LanguageItem>
                  ))}
                </LanguageDropdown>
              )}
            </LanguageSelector>
          </SettingRow>
        </SettingsCard>

        {/* Notificações */}
        <SettingsCard>
          <CardHeader><FiBell /> <CardTitle>{t('settings.notifications')}</CardTitle></CardHeader>
          <SettingRow>
            <SettingLabel><FiBell /> {t('settings.notifications.email')}</SettingLabel>
            <ToggleSwitch active={notifications} onClick={toggleNotifications}>
              <ToggleCircle active={notifications} />
            </ToggleSwitch>
          </SettingRow>
          <StatusMessage active={notifications}>
            {notifications ? (
              <><FiCheckCircle /> {t('settings.notifications.enabled')}</>
            ) : (
              <><FiXCircle /> {t('settings.notifications.disabled')}</>
            )}
          </StatusMessage>
        </SettingsCard>

        {/* Segurança - Alterar Senha */}
        <SettingsCard>
          <CardHeader><FiLock /> <CardTitle>{t('settings.security')}</CardTitle></CardHeader>
          <form onSubmit={handleChangePassword}>
            <SettingRow>
              <SettingLabel><FiLock /> {t('settings.security.current')}</SettingLabel>
              <PasswordInput
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder={t('settings.security.current')}
                required
              />
            </SettingRow>
            <SettingRow>
              <SettingLabel><FiLock /> {t('settings.security.new')}</SettingLabel>
              <PasswordInput
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder={t('settings.security.new')}
                required
              />
            </SettingRow>
            <SettingRow>
              <SettingLabel><FiLock /> {t('settings.security.confirm')}</SettingLabel>
              <PasswordInput
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={t('settings.security.confirm')}
                required
              />
            </SettingRow>
            {passwordMessage && (
              <PasswordMessage success={passwordSuccess}>
                {passwordSuccess ? <FiCheckCircle /> : <FiAlertTriangle />}
                {passwordMessage}
              </PasswordMessage>
            )}
            <SavePasswordButton type="submit">
              <FiSave /> {t('settings.security.change')}
            </SavePasswordButton>
          </form>
        </SettingsCard>

        {/* Sessões ativas */}
        <SettingsCard>
          <CardHeader><FiRefreshCw /> <CardTitle>{t('settings.sessions')}</CardTitle></CardHeader>
          {sessions.map((session) => (
            <SessionItem key={session.id}>
              <SessionInfo>
                <SessionDevice>{session.device}</SessionDevice>
                <SessionMeta>IP: {session.ip} · Último acesso: {session.lastActive}</SessionMeta>
              </SessionInfo>
              <SessionStatus active>{t('settings.sessions.active')}</SessionStatus>
            </SessionItem>
          ))}
        </SettingsCard>

        {/* Excluir Conta */}
        <SettingsCard danger>
          <CardHeader danger><FiUser /> <CardTitle danger>{t('settings.danger')}</CardTitle></CardHeader>
          <SettingRow>
            <SettingLabel style={{ color: '#ef4444' }}>
              <FiAlertTriangle /> {t('settings.danger.delete')}
            </SettingLabel>
            <DangerButton onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}>
              {showDeleteConfirm ? 'Cancelar' : t('settings.danger.delete')}
            </DangerButton>
          </SettingRow>
          {showDeleteConfirm && (
            <DeleteConfirm>
              <p><FiAlertTriangle /> Esta ação é irreversível. Digite <strong>CONFIRMAR</strong> abaixo.</p>
              <DeleteInput
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="Digite CONFIRMAR"
              />
              <ConfirmDeleteButton
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== 'CONFIRMAR'}
              >
                {t('settings.danger.confirm')}
              </ConfirmDeleteButton>
            </DeleteConfirm>
          )}
        </SettingsCard>
      </Container>
    </StyledWrapper>
  );
};

// ========== STYLED COMPONENTS ==========
const StyledWrapper = styled.div`
  font-family: 'Inter', sans-serif;
  background: ${({ theme }) => theme.background};
  min-height: calc(100vh - 70px);
  padding: 2rem;
  padding-top: calc(70px + 2rem);
  transition: background 0.3s;
`;

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const Title = styled.h1`
  font-size: 2.4rem;
  font-weight: 800;
  color: ${({ theme }) => theme.textPrimary};
`;

const Subtitle = styled.p`
  color: ${({ theme }) => theme.textSecondary};
  font-size: 1.05rem;
  margin-bottom: 2rem;
`;

const SettingsCard = styled.div`
  background: ${({ theme }) => theme.cardBackground};
  padding: 1.8rem 2rem;
  border-radius: 24px;
  box-shadow: ${({ theme }) => theme.shadow};
  margin-bottom: 1.5rem;
  border: 1px solid ${({ theme, danger }) => danger ? '#ef4444' : theme.border};
  transition: background 0.3s, border 0.3s;
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  border-bottom: 1px solid ${({ theme }) => theme.border};
  padding-bottom: 0.8rem;
  margin-bottom: 1.2rem;
  svg { color: ${({ danger }) => danger ? '#ef4444' : '#3b82f6'}; }
`;

const CardTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: ${({ theme, danger }) => danger ? '#ef4444' : theme.textPrimary};
  margin: 0;
`;

const SettingRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.8rem 0;
  &:not(:last-child) { border-bottom: 1px solid ${({ theme }) => theme.border}; }
  @media (max-width: 640px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
`;

const SettingLabel = styled.span`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${({ theme }) => theme.textSecondary};
  font-weight: 500;
  svg { color: ${({ theme }) => theme.textSecondary}; }
`;

// ========== TEMA ==========
const ThemeButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ThemeButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 1.2rem;
  border-radius: 40px;
  border: 2px solid ${({ active, theme }) => active ? '#3b82f6' : theme.border};
  background: ${({ active }) => active ? '#eff6ff' : 'transparent'};
  color: ${({ active }) => active ? '#3b82f6' : '#64748b'};
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  &:hover { border-color: #3b82f6; }
`;

// ========== IDIOMA (DROPDOWN MODERNO) ==========
const LanguageSelector = styled.div`
  position: relative;
  min-width: 180px;
`;

const LanguageDisplay = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 2px solid ${({ theme }) => theme.border};
  border-radius: 12px;
  background: ${({ theme }) => theme.inputBackground};
  color: ${({ theme }) => theme.textPrimary};
  cursor: pointer;
  transition: border-color 0.2s;
  &:hover { border-color: #3b82f6; }
  span { display: flex; align-items: center; gap: 0.5rem; }
  svg { color: ${({ theme }) => theme.textSecondary}; }
`;

const LanguageDropdown = styled.div`
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  background: ${({ theme }) => theme.cardBackground};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  z-index: 10;
  overflow: hidden;
  animation: slideDown 0.2s ease;
  @keyframes slideDown {
    from { opacity: 0; transform: translateY(-8px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const LanguageItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.6rem 1rem;
  cursor: pointer;
  color: ${({ theme }) => theme.textPrimary};
  background: ${({ active, theme }) => active ? theme.activeBg : 'transparent'};
  transition: background 0.2s;
  &:hover { background: ${({ theme }) => theme.hoverBg}; }
  span { font-size: 1.2rem; }
`;

const ActiveIndicator = styled.span`
  margin-left: auto;
  color: #3b82f6;
  font-weight: 700;
`;

// ========== NOTIFICAÇÕES ==========
const ToggleSwitch = styled.div`
  width: 48px;
  height: 26px;
  background: ${({ active }) => active ? '#3b82f6' : '#cbd5e1'};
  border-radius: 40px;
  cursor: pointer;
  transition: background 0.3s;
  display: flex;
  align-items: center;
  padding: 2px;
`;

const ToggleCircle = styled.div`
  width: 22px;
  height: 22px;
  background: #fff;
  border-radius: 50%;
  transform: ${({ active }) => active ? 'translateX(22px)' : 'translateX(0)'};
  transition: transform 0.3s;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const StatusMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  background: ${({ active }) => active ? '#dcfce7' : '#fee2e2'};
  color: ${({ active }) => active ? '#166534' : '#991b1b'};
  svg { color: inherit; }
`;

// ========== SEGURANÇA ==========
const PasswordInput = styled.input`
  padding: 0.4rem 1rem;
  border: 2px solid ${({ theme }) => theme.border};
  border-radius: 8px;
  background: ${({ theme }) => theme.inputBackground};
  color: ${({ theme }) => theme.textPrimary};
  font-size: 0.95rem;
  outline: none;
  width: 60%;
  &:focus { border-color: #3b82f6; }
  @media (max-width: 640px) { width: 100%; }
`;

const PasswordMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  margin-top: 0.5rem;
  background: ${({ success }) => success ? '#dcfce7' : '#fee2e2'};
  color: ${({ success }) => success ? '#166534' : '#991b1b'};
  font-size: 0.9rem;
`;

const SavePasswordButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.7rem 2rem;
  margin-top: 1rem;
  background: #3b82f6;
  color: #fff;
  border: none;
  border-radius: 40px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s;
  width: 100%;
  &:hover { background: #2563eb; }
`;

// ========== SESSÕES ==========
const SessionItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.8rem 0;
  border-bottom: 1px solid ${({ theme }) => theme.border};
  &:last-child { border-bottom: none; }
`;

const SessionInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
`;

const SessionDevice = styled.span`
  font-weight: 500;
  color: ${({ theme }) => theme.textPrimary};
`;

const SessionMeta = styled.span`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.textSecondary};
`;

const SessionStatus = styled.span`
  padding: 0.2rem 0.8rem;
  border-radius: 40px;
  font-size: 0.8rem;
  font-weight: 600;
  background: ${({ active }) => active ? '#dcfce7' : '#fee2e2'};
  color: ${({ active }) => active ? '#166534' : '#991b1b'};
`;

// ========== EXCLUIR CONTA ==========
const DangerButton = styled.button`
  padding: 0.4rem 1.2rem;
  background: #fee2e2;
  color: #ef4444;
  border: none;
  border-radius: 40px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  &:hover { background: #fecaca; }
`;

const DeleteConfirm = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  background: #fef2f2;
  border-radius: 12px;
  border: 1px solid #fecaca;
  p {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #991b1b;
    font-weight: 500;
    margin-bottom: 0.8rem;
    svg { color: #ef4444; }
  }
`;

const DeleteInput = styled.input`
  width: 100%;
  padding: 0.6rem 1rem;
  border: 2px solid #fecaca;
  border-radius: 8px;
  font-size: 1rem;
  background: #fff;
  outline: none;
  &:focus { border-color: #ef4444; }
`;

const ConfirmDeleteButton = styled.button`
  width: 100%;
  padding: 0.7rem;
  margin-top: 0.8rem;
  background: ${({ disabled }) => disabled ? '#cbd5e1' : '#ef4444'};
  color: #fff;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: ${({ disabled }) => disabled ? 'not-allowed' : 'pointer'};
  transition: background 0.3s;
  &:hover:not(:disabled) { background: #dc2626; }
`;

export default Settings;