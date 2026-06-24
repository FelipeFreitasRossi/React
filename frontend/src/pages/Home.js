// src/pages/Home.js
import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { useTheme } from '../contexts/ThemeContext';
import { FiTrendingUp, FiShield, FiUsers, FiZap } from 'react-icons/fi';

const Home = ({ isAuthenticated }) => {
  const { t } = useTheme();

  return (
    <StyledWrapper>
      <Hero>
        <HeroContent>
          <HeroBadge>{t('home.badge')}</HeroBadge>
          <HeroTitle>{t('home.title')}</HeroTitle>
          <HeroSubtitle>{t('home.subtitle')}</HeroSubtitle>
          <HeroButtons>
            {isAuthenticated ? (
              <PrimaryButton as={Link} to="/dashboard">
                {t('home.button.dashboard')}
              </PrimaryButton>
            ) : (
              <PrimaryButton as={Link} to="/login">
                {t('header.entrar')}
              </PrimaryButton>
            )}
            <SecondaryButton href="#features">{t('home.button.conhecer')}</SecondaryButton>
          </HeroButtons>
        </HeroContent>
        <HeroImage>
          <svg viewBox="0 0 400 300" fill="none">
            <rect x="20" y="50" width="360" height="200" rx="16" fill="#e2e8f0" />
            <rect x="40" y="80" width="80" height="60" rx="8" fill="#3b82f6" opacity="0.8" />
            <rect x="140" y="100" width="80" height="40" rx="8" fill="#8b5cf6" opacity="0.7" />
            <rect x="240" y="70" width="100" height="70" rx="8" fill="#22c55e" opacity="0.6" />
            <circle cx="310" cy="140" r="30" fill="#f59e0b" opacity="0.5" />
            <path d="M50 200 L120 150 L180 180 L250 130 L320 170 L370 150" stroke="#3b82f6" strokeWidth="4" strokeLinecap="round" />
            <circle cx="50" cy="200" r="6" fill="#3b82f6" />
            <circle cx="120" cy="150" r="6" fill="#3b82f6" />
            <circle cx="180" cy="180" r="6" fill="#3b82f6" />
            <circle cx="250" cy="130" r="6" fill="#3b82f6" />
            <circle cx="320" cy="170" r="6" fill="#3b82f6" />
            <circle cx="370" cy="150" r="6" fill="#3b82f6" />
          </svg>
        </HeroImage>
      </Hero>

      <Features id="features">
        <FeatureTitle>{t('home.features.title')}</FeatureTitle>
        <FeatureGrid>
          <FeatureCard>
            <FeatureIcon><FiTrendingUp size={32} /></FeatureIcon>
            <FeatureCardTitle>{t('home.features.realtime')}</FeatureCardTitle>
            <FeatureCardText>{t('home.features.realtime.desc')}</FeatureCardText>
          </FeatureCard>
          <FeatureCard>
            <FeatureIcon><FiShield size={32} /></FeatureIcon>
            <FeatureCardTitle>{t('home.features.security')}</FeatureCardTitle>
            <FeatureCardText>{t('home.features.security.desc')}</FeatureCardText>
          </FeatureCard>
          <FeatureCard>
            <FeatureIcon><FiUsers size={32} /></FeatureIcon>
            <FeatureCardTitle>{t('home.features.profiles')}</FeatureCardTitle>
            <FeatureCardText>{t('home.features.profiles.desc')}</FeatureCardText>
          </FeatureCard>
          <FeatureCard>
            <FeatureIcon><FiZap size={32} /></FeatureIcon>
            <FeatureCardTitle>{t('home.features.performance')}</FeatureCardTitle>
            <FeatureCardText>{t('home.features.performance.desc')}</FeatureCardText>
          </FeatureCard>
        </FeatureGrid>
      </Features>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  font-family: 'Inter', sans-serif;
  background: ${({ theme }) => theme.background || '#ffffff'};
`;

const Hero = styled.section`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4rem 2rem 3rem;
  max-width: 1200px;
  margin: 0 auto;
  gap: 3rem;
  min-height: calc(100vh - 70px);
  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
    padding: 2rem 1.5rem;
    gap: 2rem;
  }
`;

const HeroContent = styled.div`
  flex: 1;
  max-width: 600px;
  @media (max-width: 768px) { max-width: 100%; }
`;

const HeroBadge = styled.span`
  display: inline-block;
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  padding: 0.3rem 1.2rem;
  border-radius: 40px;
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 1.2rem;
  border: 1px solid rgba(59, 130, 246, 0.15);
`;

const HeroTitle = styled.h1`
  font-size: 3.2rem;
  font-weight: 800;
  color: ${({ theme }) => theme.textPrimary || '#0f172a'};
  line-height: 1.15;
  margin-bottom: 1.2rem;
  @media (max-width: 768px) { font-size: 2.2rem; }
`;

const HeroSubtitle = styled.p`
  font-size: 1.15rem;
  color: ${({ theme }) => theme.textSecondary || '#475569'};
  line-height: 1.7;
  margin-bottom: 2rem;
`;

const HeroButtons = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  @media (max-width: 768px) { justify-content: center; }
`;

const PrimaryButton = styled.a`
  display: inline-block;
  padding: 0.8rem 2.2rem;
  background: #3b82f6;
  color: #fff;
  border-radius: 40px;
  font-weight: 600;
  text-decoration: none;
  transition: background 0.3s;
  &:hover { background: #2563eb; }
`;

const SecondaryButton = styled.a`
  display: inline-block;
  padding: 0.8rem 2.2rem;
  background: transparent;
  color: ${({ theme }) => theme.textPrimary || '#0f172a'};
  border: 2px solid ${({ theme }) => theme.border || '#e2e8f0'};
  border-radius: 40px;
  font-weight: 600;
  text-decoration: none;
  transition: border-color 0.3s;
  &:hover { border-color: #3b82f6; }
`;

const HeroImage = styled.div`
  flex: 1;
  max-width: 450px;
  svg { width: 100%; height: auto; }
  @media (max-width: 768px) { max-width: 100%; }
`;

const Features = styled.section`
  padding: 4rem 2rem;
  background: ${({ theme }) => theme.background || '#f8fafc'};
`;

const FeatureTitle = styled.h2`
  text-align: center;
  font-size: 2.2rem;
  font-weight: 700;
  color: ${({ theme }) => theme.textPrimary || '#0f172a'};
  margin-bottom: 3rem;
  &::after {
    content: '';
    display: block;
    width: 60px;
    height: 4px;
    background: linear-gradient(90deg, #3b82f6, #8b5cf6);
    margin: 0.8rem auto 0;
    border-radius: 4px;
  }
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const FeatureCard = styled.div`
  background: ${({ theme }) => theme.cardBackground || '#ffffff'};
  padding: 2rem 1.5rem;
  border-radius: 24px;
  text-align: center;
  box-shadow: ${({ theme }) => theme.shadow || '0 4px 12px rgba(0,0,0,0.03)'};
  border: 1px solid ${({ theme }) => theme.border || '#f1f5f9'};
  transition: transform 0.3s;
  &:hover { transform: translateY(-6px); }
`;

const FeatureIcon = styled.div`
  color: #3b82f6;
  margin-bottom: 1rem;
`;

const FeatureCardTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  color: ${({ theme }) => theme.textPrimary || '#0f172a'};
  margin-bottom: 0.6rem;
`;

const FeatureCardText = styled.p`
  font-size: 0.95rem;
  color: ${({ theme }) => theme.textSecondary || '#64748b'};
  line-height: 1.6;
`;

export default Home;