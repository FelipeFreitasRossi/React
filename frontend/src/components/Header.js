// src/components/Header.js
import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { 
  FiMenu, FiX, FiUser, FiLogOut, FiSettings, FiActivity,
  FiHome, FiTrendingUp, FiMail, FiInfo, FiLogIn, FiDollarSign
} from 'react-icons/fi';
import { useTheme } from '../contexts/ThemeContext';

const Header = ({ user, onLogout }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTheme(); // Função de tradução

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  const displayName = user?.username || 'Usuário';
  const firstLetter = displayName.charAt(0).toUpperCase();
  const userPhoto = user?.photo || null;

  // Itens de navegação com tradução
  const navItems = [
    { label: t('header.home'), icon: <FiHome />, path: '/' },
    { label: t('header.dashboard'), icon: <FiTrendingUp />, path: '/dashboard' },
    { label: t('header.moedas'), icon: <FiDollarSign />, path: '/moedas' },
    { label: t('header.sobre'), icon: <FiInfo />, path: '/sobre' },
    { label: t('header.contato'), icon: <FiMail />, path: '/contato' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <StyledWrapper>
      <HeaderContainer>
        <Logo to="/">
          <FiActivity size={28} color="#3b82f6" />
          <span>FinDash</span>
        </Logo>

        <NavMenu className={menuOpen ? 'open' : ''}>
          {navItems.map((item, index) => (
            <NavLink
              key={index}
              to={item.path}
              className={isActive(item.path) ? 'active' : ''}
              onClick={() => setMenuOpen(false)}
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </NavMenu>

        <UserArea>
          {user ? (
            <UserInfo ref={dropdownRef}>
              <UserAvatar onClick={toggleDropdown}>
                {userPhoto ? <AvatarImage src={userPhoto} alt={displayName} /> : firstLetter || 'U'}
              </UserAvatar>
              <UserName>{displayName}</UserName>
              <DropdownArrow onClick={toggleDropdown}>▼</DropdownArrow>
              {dropdownOpen && (
                <DropdownMenu>
                  <DropdownItem as={Link} to="/perfil" onClick={() => setDropdownOpen(false)}>
                    <FiUser /> {t('header.perfil')}
                  </DropdownItem>
                  <DropdownItem as={Link} to="/configuracoes" onClick={() => setDropdownOpen(false)}>
                    <FiSettings /> {t('header.configuracoes')}
                  </DropdownItem>
                  <DropdownDivider />
                  <DropdownItem
                    onClick={() => {
                      onLogout();
                      navigate('/');
                    }}
                    style={{ color: '#ef4444' }}
                  >
                    <FiLogOut /> {t('header.sair')}
                  </DropdownItem>
                </DropdownMenu>
              )}
            </UserInfo>
          ) : (
            <LoginButton to="/login">
              <FiLogIn size={16} /> {t('header.entrar')}
            </LoginButton>
          )}
          {/* Hambúrguer só aparece se estiver logado */}
          {user && (
            <Hamburger onClick={toggleMenu}>
              {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </Hamburger>
          )}
        </UserArea>
      </HeaderContainer>
    </StyledWrapper>
  );
};

// ========== STYLED COMPONENTS ==========
const StyledWrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: ${({ theme }) => theme?.headerBackground || 'rgba(255, 255, 255, 0.85)'};
  backdrop-filter: blur(12px);
  border-bottom: 1px solid ${({ theme }) => theme?.border || 'rgba(226, 232, 240, 0.6)'};
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
`;

const HeaderContainer = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.8rem 2rem;
  max-width: 1400px;
  margin: 0 auto;
  height: 70px;
  @media (max-width: 768px) {
    padding: 0.8rem 1.2rem;
    height: 60px;
  }
`;

const Logo = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 1.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme?.textPrimary || '#0f172a'};
  text-decoration: none;
  span { letter-spacing: -0.5px; }
  @media (max-width: 480px) { font-size: 1.2rem; }
`;

const NavMenu = styled.nav`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  @media (max-width: 768px) {
    position: fixed;
    top: 60px;
    left: 0;
    right: 0;
    background: ${({ theme }) => theme?.cardBackground || 'rgba(255, 255, 255, 0.98)'};
    backdrop-filter: blur(12px);
    flex-direction: column;
    padding: 1.5rem;
    gap: 0.8rem;
    border-bottom: 1px solid ${({ theme }) => theme?.border || '#e2e8f0'};
    transform: ${({ className }) => (className?.includes('open') ? 'translateY(0)' : 'translateY(-120%)')};
    transition: transform 0.3s ease;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  }
`;

const NavLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 30px;
  color: ${({ theme }) => theme?.textSecondary || '#475569'};
  text-decoration: none;
  font-weight: 500;
  font-size: 0.95rem;
  transition: all 0.2s;
  &:hover { background: rgba(59, 130, 246, 0.06); color: #3b82f6; }
  &.active { background: rgba(59, 130, 246, 0.1); color: #3b82f6; font-weight: 600; }
  svg { width: 18px; height: 18px; }
  @media (max-width: 768px) {
    width: 100%;
    padding: 0.7rem 1.2rem;
    font-size: 1rem;
  }
`;

const UserArea = styled.div`
  display: flex;
  align-items: center;
  gap: 1.2rem;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  position: relative;
  cursor: pointer;
`;

const UserAvatar = styled.div`
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: transform 0.2s;
  overflow: hidden;
  &:hover { transform: scale(1.05); }
`;

const AvatarImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const UserName = styled.span`
  font-weight: 500;
  color: ${({ theme }) => theme?.textPrimary || '#0f172a'};
  font-size: 0.95rem;
  @media (max-width: 480px) { display: none; }
`;

const DropdownArrow = styled.span`
  font-size: 0.6rem;
  color: ${({ theme }) => theme?.textSecondary || '#94a3b8'};
  @media (max-width: 480px) { display: none; }
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: 48px;
  right: 0;
  background: ${({ theme }) => theme?.cardBackground || '#ffffff'};
  border-radius: 16px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.08);
  border: 1px solid ${({ theme }) => theme?.border || '#f1f5f9'};
  min-width: 200px;
  padding: 0.5rem 0;
  z-index: 1001;
  animation: slideDown 0.2s ease;
  @keyframes slideDown {
    from { opacity: 0; transform: translateY(-8px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const DropdownItem = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.7rem 1.2rem;
  color: ${({ theme }) => theme?.textPrimary || '#334155'};
  font-size: 0.95rem;
  text-decoration: none;
  cursor: pointer;
  transition: background 0.2s;
  &:hover { background: ${({ theme }) => theme?.background || '#f8fafc'}; }
  svg { width: 18px; height: 18px; color: ${({ theme }) => theme?.textSecondary || '#64748b'}; }
`;

const DropdownDivider = styled.hr`
  margin: 0.3rem 0;
  border: none;
  border-top: 1px solid ${({ theme }) => theme?.border || '#f1f5f9'};
`;

const LoginButton = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 1.2rem;
  background: #3b82f6;
  color: white;
  border-radius: 40px;
  font-weight: 600;
  text-decoration: none;
  font-size: 0.95rem;
  transition: background 0.2s;
  &:hover { background: #2563eb; }
`;

const Hamburger = styled.button`
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  color: ${({ theme }) => theme?.textPrimary || '#0f172a'};
  padding: 0.2rem;
  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

export default Header;