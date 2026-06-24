// src/pages/Crypto.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';
import { useTheme } from '../contexts/ThemeContext';
import { FiTrendingUp, FiTrendingDown, FiRefreshCw } from 'react-icons/fi';

const Crypto = () => {
  const { t } = useTheme();
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const socketRef = useRef(null);

  // 🔹 Envolva fetchPrices em useCallback para estabilizar a referência
  const fetchPrices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('http://localhost:5000/api/crypto-prices');
      if (!res.ok) throw new Error(t('crypto.error'));
      const data = await res.json();
      setPrices(data);
    } catch (err) {
      setError(err.message);
      setPrices([
        { symbol: 'BTC-USD', name: 'Bitcoin', price: 60000, change_24h: 2.5 },
        { symbol: 'ETH-USD', name: 'Ethereum', price: 3000, change_24h: -1.2 },
        { symbol: 'USDBRL=X', name: 'Dólar/BRL', price: 5.20, change_24h: 0.3 },
      ]);
    } finally {
      setLoading(false);
    }
  }, [t]); // depende de t (tradução)

  // 🔹 Adicione fetchPrices à lista de dependências
  useEffect(() => {
    fetchPrices();
  }, [fetchPrices]);

  // WebSocket (sem alterações)
  useEffect(() => {
    socketRef.current = new WebSocket('ws://localhost:8765');
    socketRef.current.onopen = () => console.log('✅ WebSocket conectado');
    socketRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setPrices(prevPrices => {
          return prevPrices.map(item => {
            const newPrice = data.symbols[item.symbol];
            if (newPrice) {
              const change = ((newPrice - item.price) / item.price) * 100;
              return { ...item, price: newPrice, change_24h: parseFloat(change.toFixed(2)) };
            }
            return item;
          });
        });
      } catch (err) { console.error(err); }
    };
    socketRef.current.onerror = (error) => console.error('WebSocket error:', error);
    socketRef.current.onclose = () => console.log('WebSocket desconectado');
    return () => { if (socketRef.current) socketRef.current.close(); };
  }, []);

  const formatCurrency = (value) => {
    if (value >= 1000) return `$${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
    return `$${value.toFixed(2)}`;
  };

  return (
    <StyledWrapper>
      <Container>
        <Header>
          <Title>{t('crypto.title')}</Title>
          <RefreshButton onClick={fetchPrices} disabled={loading}>
            <FiRefreshCw className={loading ? 'spinning' : ''} />
          </RefreshButton>
        </Header>
        <Subtitle>{t('crypto.subtitle')}</Subtitle>
        {error && <ErrorMessage>⚠️ {error}</ErrorMessage>}
        <Grid>
          {prices.map((item) => (
            <Card key={item.symbol}>
              <CardHeader>
                <CardSymbol>{item.symbol}</CardSymbol>
                <CardName>{item.name}</CardName>
              </CardHeader>
              <CardPrice>{formatCurrency(item.price)}</CardPrice>
              <CardChange positive={item.change_24h >= 0}>
                {item.change_24h >= 0 ? <FiTrendingUp /> : <FiTrendingDown />}
                {item.change_24h.toFixed(2)}%
              </CardChange>
            </Card>
          ))}
        </Grid>
        {loading && <Loader><span>{t('crypto.loading')}</span></Loader>}
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
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const Title = styled.h1`
  font-size: 2.4rem;
  font-weight: 800;
  color: ${({ theme }) => theme.textPrimary || '#0f172a'};
`;

const Subtitle = styled.p`
  color: ${({ theme }) => theme.textSecondary || '#64748b'};
  font-size: 1.05rem;
  margin-bottom: 2rem;
`;

const RefreshButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: ${({ theme }) => theme.textSecondary || '#64748b'};
  padding: 0.5rem;
  font-size: 1.5rem;
  transition: transform 0.3s;
  &:hover { transform: rotate(180deg); }
  .spinning { animation: spin 1s linear infinite; }
  @keyframes spin { 100% { transform: rotate(360deg); } }
`;

const ErrorMessage = styled.div`
  background: #fee2e2;
  color: #991b1b;
  padding: 1rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1.5rem;
`;

const Card = styled.div`
  background: ${({ theme }) => theme.cardBackground || '#ffffff'};
  border-radius: 20px;
  padding: 1.5rem;
  box-shadow: ${({ theme }) => theme.shadow || '0 4px 12px rgba(0,0,0,0.02)'};
  border: 1px solid ${({ theme }) => theme.border || '#f1f5f9'};
  transition: transform 0.2s;
  &:hover { transform: translateY(-4px); }
`;

const CardHeader = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 0.8rem;
`;

const CardSymbol = styled.span`
  font-weight: 700;
  font-size: 1.1rem;
  color: ${({ theme }) => theme.textPrimary || '#0f172a'};
`;

const CardName = styled.span`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.textSecondary || '#64748b'};
`;

const CardPrice = styled.div`
  font-size: 1.8rem;
  font-weight: 700;
  color: ${({ theme }) => theme.textPrimary || '#0f172a'};
  margin: 0.5rem 0;
`;

const CardChange = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-weight: 600;
  color: ${({ positive }) => (positive ? '#22c55e' : '#ef4444')};
  background: ${({ positive, theme }) =>
    positive ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)'};
  padding: 0.2rem 0.8rem;
  border-radius: 40px;
  display: inline-flex;
  width: fit-content;
`;

const Loader = styled.div`
  text-align: center;
  padding: 2rem;
  color: ${({ theme }) => theme.textSecondary || '#64748b'};
`;

export default Crypto;