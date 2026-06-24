// src/pages/Contact.js
import React, { useState } from 'react';
import styled from 'styled-components';
import { useTheme } from '../contexts/ThemeContext';
import { FiMail, FiPhone, FiMapPin, FiSend, FiCheckCircle } from 'react-icons/fi';

const Contact = () => {
  const { t } = useTheme();
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Dados enviados:', formData);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <StyledWrapper>
      <Container>
        <Title>{t('contact.title')}</Title>
        <Subtitle>{t('contact.subtitle')}</Subtitle>
        <ContactGrid>
          <ContactInfo>
            <InfoCard>
              <FiMail size={24} />
              <div>
                <h4>{t('contact.email')}</h4>
                <p>contato@findash.com</p>
              </div>
            </InfoCard>
            <InfoCard>
              <FiPhone size={24} />
              <div>
                <h4>{t('contact.phone')}</h4>
                <p>+55 (11) 99999-9999</p>
              </div>
            </InfoCard>
            <InfoCard>
              <FiMapPin size={24} />
              <div>
                <h4>{t('contact.address')}</h4>
                <p>São Paulo, SP - Brasil</p>
              </div>
            </InfoCard>
          </ContactInfo>
          <Form onSubmit={handleSubmit}>
            <FormGroup>
              <Label>{t('contact.form.name')}</Label>
              <Input type="text" name="name" placeholder="Seu nome" value={formData.name} onChange={handleChange} required />
            </FormGroup>
            <FormGroup>
              <Label>{t('contact.form.email')}</Label>
              <Input type="email" name="email" placeholder="seu@email.com" value={formData.email} onChange={handleChange} required />
            </FormGroup>
            <FormGroup>
              <Label>{t('contact.form.message')}</Label>
              <Textarea name="message" rows="5" placeholder="Sua mensagem..." value={formData.message} onChange={handleChange} required />
            </FormGroup>
            <SubmitButton type="submit">
              <FiSend /> {t('contact.form.send')}
            </SubmitButton>
            {submitted && <SuccessMessage><FiCheckCircle /> {t('contact.form.success')}</SuccessMessage>}
          </Form>
        </ContactGrid>
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
  margin: 1.2rem auto 3rem;
  line-height: 1.7;
`;

const ContactGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 3rem;
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
`;

const ContactInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const InfoCard = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  background: ${({ theme }) => theme.cardBackground || '#f8fafc'};
  padding: 1.2rem 1.5rem;
  border-radius: 16px;
  border: 1px solid ${({ theme }) => theme.border || '#e2e8f0'};
  svg { color: #3b82f6; flex-shrink: 0; }
  h4 { font-size: 1rem; color: ${({ theme }) => theme.textPrimary || '#0f172a'}; margin: 0; }
  p { font-size: 0.95rem; color: ${({ theme }) => theme.textSecondary || '#64748b'}; margin: 0; }
`;

const Form = styled.form`
  background: ${({ theme }) => theme.cardBackground || '#f8fafc'};
  padding: 2rem;
  border-radius: 24px;
  border: 1px solid ${({ theme }) => theme.border || '#e2e8f0'};
`;

const FormGroup = styled.div`
  margin-bottom: 1.2rem;
`;

const Label = styled.label`
  display: block;
  font-weight: 500;
  color: ${({ theme }) => theme.textPrimary || '#0f172a'};
  margin-bottom: 0.4rem;
  font-size: 0.95rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.7rem 1rem;
  border: 2px solid ${({ theme }) => theme.border || '#e2e8f0'};
  border-radius: 12px;
  background: ${({ theme }) => theme.inputBackground || '#ffffff'};
  color: ${({ theme }) => theme.textPrimary || '#0f172a'};
  font-size: 1rem;
  outline: none;
  transition: border 0.2s;
  &:focus { border-color: #3b82f6; }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 0.7rem 1rem;
  border: 2px solid ${({ theme }) => theme.border || '#e2e8f0'};
  border-radius: 12px;
  background: ${({ theme }) => theme.inputBackground || '#ffffff'};
  color: ${({ theme }) => theme.textPrimary || '#0f172a'};
  font-size: 1rem;
  outline: none;
  font-family: inherit;
  resize: vertical;
  &:focus { border-color: #3b82f6; }
`;

const SubmitButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.8rem;
  background: #3b82f6;
  color: #fff;
  border: none;
  border-radius: 40px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.3s;
  &:hover { background: #2563eb; }
`;

const SuccessMessage = styled.p`
  margin-top: 1rem;
  padding: 0.8rem;
  background: #dcfce7;
  color: #166534;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  justify-content: center;
`;

export default Contact;