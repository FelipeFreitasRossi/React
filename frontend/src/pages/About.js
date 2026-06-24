// src/pages/About.js
import React from 'react';
import styled from 'styled-components';
import { useTheme } from '../contexts/ThemeContext';
import { FiUsers, FiTarget, FiGlobe, FiAward } from 'react-icons/fi';

const About = () => {
  const { t } = useTheme();

  return (
    <StyledWrapper>
      <Container>
        <Title>{t('about.title')}</Title>
        <Subtitle>{t('about.subtitle')}</Subtitle>
        <Grid>
          <Card>
            <Icon><FiUsers size={36} /></Icon>
            <CardTitle>{t('about.team')}</CardTitle>
            <CardText>{t('about.team.desc')}</CardText>
          </Card>
          <Card>
            <Icon><FiTarget size={36} /></Icon>
            <CardTitle>{t('about.focus')}</CardTitle>
            <CardText>{t('about.focus.desc')}</CardText>
          </Card>
          <Card>
            <Icon><FiGlobe size={36} /></Icon>
            <CardTitle>{t('about.global')}</CardTitle>
            <CardText>{t('about.global.desc')}</CardText>
          </Card>
          <Card>
            <Icon><FiAward size={36} /></Icon>
            <CardTitle>{t('about.tech')}</CardTitle>
            <CardText>{t('about.tech.desc')}</CardText>
          </Card>
        </Grid>
        <CallToAction>
          <h3>{t('about.cta.title')}</h3>
          <p>{t('about.cta.desc')}</p>
          <ActionButton href="/dashboard">{t('about.cta.button')}</ActionButton>
        </CallToAction>
      </Container>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  font-family: 'Inter', sans-serif;
  background: ${({ theme }) => theme.background || '#ffffff'};
  padding-top: 70px;
  min-height: calc(100vh - 70px);
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 3rem 2rem 5rem;
`;

const Title = styled.h1`
  font-size: 2.8rem;
  font-weight: 800;
  color: ${({ theme }) => theme.textPrimary || '#0f172a'};
  text-align: center;
  margin-bottom: 1rem;
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

const Subtitle = styled.p`
  text-align: center;
  font-size: 1.15rem;
  color: ${({ theme }) => theme.textSecondary || '#475569'};
  max-width: 700px;
  margin: 0 auto 3rem;
  line-height: 1.7;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 2rem;
  margin-bottom: 4rem;
`;

const Card = styled.div`
  background: ${({ theme }) => theme.cardBackground || '#f8fafc'};
  padding: 2rem 1.5rem;
  border-radius: 24px;
  text-align: center;
  transition: transform 0.3s;
  &:hover { transform: translateY(-4px); }
`;

const Icon = styled.div`
  color: #3b82f6;
  margin-bottom: 1rem;
`;

const CardTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  color: ${({ theme }) => theme.textPrimary || '#0f172a'};
  margin-bottom: 0.6rem;
`;

const CardText = styled.p`
  font-size: 0.95rem;
  color: ${({ theme }) => theme.textSecondary || '#64748b'};
  line-height: 1.6;
`;

const CallToAction = styled.div`
  text-align: center;
  background: ${({ theme }) => theme.cardBackground || '#0f172a'};
  padding: 3rem 2rem;
  border-radius: 30px;
  color: ${({ theme }) => theme.textPrimary || '#fff'};
  border: 1px solid ${({ theme }) => theme.border || '#1e293b'};

  h3 { font-size: 2rem; margin-bottom: 0.5rem; }
  p { color: ${({ theme }) => theme.textSecondary || '#94a3b8'}; margin-bottom: 1.5rem; }
`;

const ActionButton = styled.a`
  display: inline-block;
  padding: 0.8rem 2.5rem;
  background: #3b82f6;
  color: #fff;
  border-radius: 40px;
  font-weight: 600;
  text-decoration: none;
  transition: background 0.3s;
  &:hover { background: #2563eb; }
`;

export default About;