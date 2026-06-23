// src/pages/About.js
import React from 'react';
import styled from 'styled-components';
import { FiUsers, FiTarget, FiGlobe, FiAward } from 'react-icons/fi';

const About = () => {
  return (
    <StyledWrapper>
      <Container>
        <Title>Sobre o FinDash</Title>
        <Subtitle>
          Nossa missão é democratizar o acesso a informações financeiras
          de qualidade, oferecendo ferramentas poderosas e intuitivas para
          todos os investidores.
        </Subtitle>

        <Grid>
          <Card>
            <Icon><FiUsers size={36} /></Icon>
            <CardTitle>Time Experiente</CardTitle>
            <CardText>
              Somos uma equipe apaixonada por tecnologia e finanças,
              com anos de experiência no mercado.
            </CardText>
          </Card>
          <Card>
            <Icon><FiTarget size={36} /></Icon>
            <CardTitle>Foco no Usuário</CardTitle>
            <CardText>
              Desenvolvemos cada funcionalidade pensando na melhor
              experiência e usabilidade para você.
            </CardText>
          </Card>
          <Card>
            <Icon><FiGlobe size={36} /></Icon>
            <CardTitle>Dados Globais</CardTitle>
            <CardText>
              Acesse dados de ações, criptomoedas e índices de todo o
              mundo com alta precisão.
            </CardText>
          </Card>
          <Card>
            <Icon><FiAward size={36} /></Icon>
            <CardTitle>Tecnologia de Ponta</CardTitle>
            <CardText>
              Utilizamos as mais modernas tecnologias para garantir
              performance, segurança e escalabilidade.
            </CardText>
          </Card>
        </Grid>

        <CallToAction>
          <h3>Pronto para começar?</h3>
          <p>Crie sua conta e comece a acompanhar seus investimentos agora mesmo.</p>
          <ActionButton href="/dashboard">Acessar Dashboard</ActionButton>
        </CallToAction>
      </Container>
    </StyledWrapper>
  );
};

// ========== STYLED COMPONENTS ==========
const StyledWrapper = styled.div`
  font-family: 'Inter', sans-serif;
  background: #ffffff;
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
  color: #0f172a;
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
  color: #475569;
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
  background: #f8fafc;
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
  color: #0f172a;
  margin-bottom: 0.6rem;
`;

const CardText = styled.p`
  font-size: 0.95rem;
  color: #64748b;
  line-height: 1.6;
`;

const CallToAction = styled.div`
  text-align: center;
  background: #0f172a;
  padding: 3rem 2rem;
  border-radius: 30px;
  color: #fff;

  h3 {
    font-size: 2rem;
    margin-bottom: 0.5rem;
  }
  p {
    color: #94a3b8;
    margin-bottom: 1.5rem;
  }
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