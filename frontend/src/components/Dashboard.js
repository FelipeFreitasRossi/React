// src/components/Dashboard.js
import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  FiRefreshCw,
  FiTrendingUp,
  FiTrendingDown,
  FiActivity,
  FiLogOut,
  FiBarChart2,
  FiArrowUp,
  FiArrowDown,
} from 'react-icons/fi';
import { io } from 'socket.io-client';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
`;

const Dashboard = ({ onLogout }) => {
  const [symbol, setSymbol] = useState('AAPL');
  const [companyName, setCompanyName] = useState('');
  const [period, setPeriod] = useState('1mo');
  const [historicalData, setHistoricalData] = useState([]);
  const [livePrice, setLivePrice] = useState(null);
  const [priceChange, setPriceChange] = useState(0);
  const [priceChangePercent, setPriceChangePercent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    open: 0,
    high: 0,
    low: 0,
    volume: 0,
  });
  const socketRef = useRef(null);

  useEffect(() => {
    fetchHistorical(symbol, period);
    fetchCompanyInfo(symbol);
  }, [symbol, period]);

  useEffect(() => {
    socketRef.current = io('ws://localhost:8765', {
      transports: ['websocket'],
      reconnectionAttempts: 5,
    });

    socketRef.current.on('connect', () => {
      console.log('✅ Conectado ao WebSocket');
    });

    socketRef.current.on('message', (data) => {
      const parsed = JSON.parse(data);
      setLivePrice(parsed.price);
      setHistoricalData((prev) => {
        if (prev.length === 0) return prev;
        const last = prev[prev.length - 1];
        const today = new Date().toISOString().slice(0, 10);
        if (last.Date === today) {
          const updated = [...prev];
          updated[updated.length - 1] = { ...last, Close: parsed.price };
          return updated;
        }
        return [
          ...prev,
          {
            Date: today,
            Open: parsed.price,
            High: parsed.price,
            Low: parsed.price,
            Close: parsed.price,
            Volume: 0,
          },
        ];
      });
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const fetchCompanyInfo = async (sym) => {
    try {
      const res = await fetch(`http://localhost:5000/api/company-info?symbol=${sym}`);
      const data = await res.json();
      if (!data.error) {
        setCompanyName(data.name || sym);
      } else {
        setCompanyName(sym);
      }
    } catch (err) {
      setCompanyName(sym);
    }
  };

  const fetchHistorical = async (sym, period) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`http://localhost:5000/api/historical?symbol=${sym}&period=${period}`);
      const data = await res.json();
      if (!data.error) {
        setHistoricalData(data);
        if (data.length > 0) {
          const last = data[data.length - 1];
          const first = data[0];
          const open = data[0]?.Open || 0;
          const high = Math.max(...data.map((d) => d.High || 0));
          const low = Math.min(...data.map((d) => d.Low || Infinity));
          const volume = data.reduce((acc, d) => acc + (d.Volume || 0), 0);
          setStats({ open, high, low, volume });
          const change = last.Close - first.Open;
          const changePercent = ((last.Close - first.Open) / first.Open) * 100;
          setPriceChange(change);
          setPriceChangePercent(changePercent);
        }
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const calculateSMA = (data, window) => {
    const sma = [];
    for (let i = 0; i < data.length; i++) {
      if (i < window - 1) {
        sma.push(null);
        continue;
      }
      let sum = 0;
      for (let j = i - window + 1; j <= i; j++) {
        sum += data[j].Close;
      }
      sma.push(+(sum / window).toFixed(2));
    }
    return sma;
  };

  const chartData = historicalData.map((item) => ({ ...item, SMA7: null, SMA21: null }));
  if (historicalData.length > 0) {
    const sma7 = calculateSMA(historicalData, 7);
    const sma21 = calculateSMA(historicalData, 21);
    chartData.forEach((item, i) => {
      item.SMA7 = sma7[i];
      item.SMA21 = sma21[i];
    });
  }

  const formatCurrency = (value) => `$${value?.toFixed(2) || '---'}`;
  const formatVolume = (value) => (value ? (value / 1e6).toFixed(1) + 'M' : '---');
  const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  const periods = [
    { label: '1D', value: '1d' },
    { label: '1S', value: '5d' },
    { label: '1M', value: '1mo' },
    { label: '3M', value: '3mo' },
    { label: '1A', value: '1y' },
    { label: '5A', value: '5y' },
  ];

  return (
    <StyledWrapper>
      <MainContent>
        {/* Períodos */}
        <PeriodSelector>
          {periods.map((p) => (
            <PeriodButton
              key={p.value}
              active={period === p.value}
              onClick={() => setPeriod(p.value)}
            >
              {p.label}
            </PeriodButton>
          ))}
        </PeriodSelector>

        {/* Estatísticas rápidas */}
        <StatsGrid>
          <StatCard>
            <StatLabel><FiArrowUp color="#22c55e" /> Abertura</StatLabel>
            <StatValue>{formatCurrency(stats.open)}</StatValue>
          </StatCard>
          <StatCard>
            <StatLabel><FiArrowUp color="#22c55e" /> Máxima</StatLabel>
            <StatValue>{formatCurrency(stats.high)}</StatValue>
          </StatCard>
          <StatCard>
            <StatLabel><FiArrowDown color="#ef4444" /> Mínima</StatLabel>
            <StatValue>{formatCurrency(stats.low)}</StatValue>
          </StatCard>
          <StatCard>
            <StatLabel><FiBarChart2 /> Volume</StatLabel>
            <StatValue>{formatVolume(stats.volume)}</StatValue>
          </StatCard>
        </StatsGrid>

        {/* Gráfico principal */}
        <ChartCard>
          <ChartHeader>
            <ChartTitle>Gráfico de Velas</ChartTitle>
            <ChartSubtitle>
              {companyName} ({symbol}) · {new Date().toLocaleDateString('pt-BR')}
            </ChartSubtitle>
          </ChartHeader>
          <ResponsiveContainer width="100%" height={400}>
            {loading ? (
              <SkeletonPlaceholder><span>Carregando dados...</span></SkeletonPlaceholder>
            ) : error ? (
              <SkeletonPlaceholder><span style={{ color: '#ef4444' }}>Erro: {error}</span></SkeletonPlaceholder>
            ) : (
              <ComposedChart data={chartData}>
                <defs>
                  <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="Date" tickFormatter={formatDate} tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis yAxisId="left" domain={['auto', 'auto']} tickFormatter={formatCurrency} tick={{ fontSize: 11, fill: '#64748b' }} width={70} />
                <YAxis yAxisId="right" orientation="right" domain={[0, 'auto']} tickFormatter={formatVolume} tick={{ fontSize: 11, fill: '#64748b' }} width={50} />
                <Tooltip
                  contentStyle={{ background: 'rgba(255,255,255,0.9)', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                  formatter={(value, name) => name === 'Volume' ? formatVolume(value) : formatCurrency(value)}
                  labelFormatter={(label) => `Data: ${label}`}
                />
                <Bar yAxisId="left" dataKey="Close" fill="#3b82f6" barSize={4} opacity={0.9} />
                <Line yAxisId="left" type="monotone" dataKey="SMA7" stroke="#f59e0b" strokeWidth={2} dot={false} connectNulls />
                <Line yAxisId="left" type="monotone" dataKey="SMA21" stroke="#8b5cf6" strokeWidth={2} dot={false} connectNulls />
                <Bar yAxisId="right" dataKey="Volume" fill="url(#colorVolume)" barSize={2} opacity={0.5} />
              </ComposedChart>
            )}
          </ResponsiveContainer>
          <LegendContainer>
            <LegendItem color="#3b82f6">Preço</LegendItem>
            <LegendItem color="#f59e0b">SMA 7</LegendItem>
            <LegendItem color="#8b5cf6">SMA 21</LegendItem>
            <LegendItem color="#3b82f6" opacity={0.3}>Volume</LegendItem>
          </LegendContainer>
        </ChartCard>

        {/* Tabela de cotações */}
        <TableCard>
          <TableTitle>Últimas 10 cotações</TableTitle>
          <Table>
            <thead>
              <tr><th>Data</th><th>Abertura</th><th>Máxima</th><th>Mínima</th><th>Fechamento</th><th>Volume</th></tr>
            </thead>
            <tbody>
              {historicalData.slice(-10).reverse().map((item, idx) => (
                <tr key={idx}>
                  <td>{item.Date}</td>
                  <td>{formatCurrency(item.Open)}</td>
                  <td>{formatCurrency(item.High)}</td>
                  <td>{formatCurrency(item.Low)}</td>
                  <td>{formatCurrency(item.Close)}</td>
                  <td>{formatVolume(item.Volume)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </TableCard>
      </MainContent>
    </StyledWrapper>
  );
};

// No StyledWrapper do Dashboard.js
const StyledWrapper = styled.div`
  font-family: 'Inter', ...;
  background: #f1f5f9;
  min-height: calc(100vh - 70px);
  padding: clamp(1rem, 3vw, 2rem);
  padding-top: calc(70px + 1.5rem);
  animation: ${fadeIn} 0.6s ease-out;
  @media (max-width: 768px) {
    padding-top: calc(60px + 1rem);
  }
`;

const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
`;

const PeriodSelector = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  background: #fff;
  padding: 0.5rem 1rem;
  border-radius: 40px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.02);
  align-self: flex-start;
`;

const PeriodButton = styled.button`
  padding: 0.3rem 1rem;
  border-radius: 30px;
  border: none;
  background: ${({ active }) => (active ? '#3b82f6' : 'transparent')};
  color: ${({ active }) => (active ? '#fff' : '#64748b')};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  &:hover { background: ${({ active }) => (active ? '#2563eb' : '#f1f5f9')}; }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
`;

const StatCard = styled.div`
  background: #fff;
  padding: 1rem 1.2rem;
  border-radius: 20px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.02);
`;

const StatLabel = styled.div`
  font-size: 0.75rem;
  color: #64748b;
  text-transform: uppercase;
  display: flex;
  align-items: center;
  gap: 0.4rem;
`;

const StatValue = styled.div`
  font-size: 1.4rem;
  font-weight: 700;
  color: #0f172a;
  margin-top: 0.2rem;
`;

const ChartCard = styled.div`
  background: #fff;
  padding: 1.5rem;
  border-radius: 24px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.02);
`;

const ChartHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
`;

const ChartTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  color: #0f172a;
`;

const ChartSubtitle = styled.span`
  font-size: 0.9rem;
  color: #64748b;
`;

const LegendContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1.2rem;
  margin-top: 1rem;
  justify-content: center;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.85rem;
  color: #475569;
  &::before {
    content: '';
    display: inline-block;
    width: 12px;
    height: 3px;
    background: ${({ color }) => color};
    opacity: ${({ opacity }) => opacity || 1};
    border-radius: 4px;
  }
`;

const SkeletonPlaceholder = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #94a3b8;
  animation: ${pulse} 1.5s infinite;
  span { font-size: 1rem; }
`;

const TableCard = styled.div`
  background: #fff;
  padding: 1.5rem;
  border-radius: 24px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.02);
  overflow-x: auto;
`;

const TableTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #0f172a;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
  min-width: 500px;
  th {
    text-align: left;
    padding: 0.7rem 0.5rem;
    color: #64748b;
    font-weight: 500;
    border-bottom: 2px solid #f1f5f9;
  }
  td {
    padding: 0.6rem 0.5rem;
    border-bottom: 1px solid #f1f5f9;
  }
  tr:last-child td { border-bottom: none; }
`;

export default Dashboard;