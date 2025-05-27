# Sistema de Componentes VidaShield

Este diretório contém os componentes padrão do VidaShield, baseados no design original do backup. Todos os componentes seguem o mesmo padrão visual: sem bordas visíveis, efeito glow sutil verde, e visual moderno.

## Componentes Disponíveis

### 🎯 **VidaCard** - Container básico
Container base para qualquer conteúdo.

```tsx
<VidaCard title="Título" subtitle="Subtítulo opcional" fullHeight={true}>
  <p>Conteúdo aqui</p>
</VidaCard>
```

### 📊 **VidaWidget** - Widget completo com loading/error
Componente completo para widgets com estados de loading e error automatizados.

```tsx
<VidaWidget
  title="Título do Widget"
  loading={isLoading}
  error={errorMessage}
  fullHeight={true}
  actions={<button>Ação</button>}
>
  <p>Conteúdo do widget</p>
</VidaWidget>
```

### 📦 **VidaInnerCard** - Card interno
Para cards dentro de widgets, com hover suave.

```tsx
<VidaInnerCard>
  <p>Conteúdo do card interno</p>
</VidaInnerCard>
```

### 📈 **VidaStatCard** - Card de estatística
Para exibir métricas e estatísticas.

```tsx
<VidaStatCard
  icon={<Users className="w-7 h-7" />}
  title="Usuários Ativos"
  value={1234}
  iconColor="text-green-400"
  valueColor="text-green-300"
/>
```

### 🏷️ **VidaBadge** - Badge/Etiqueta
Para status e categorizações.

```tsx
<VidaBadge variant="success">Online</VidaBadge>
<VidaBadge variant="critical">Crítico</VidaBadge>
<VidaBadge variant="warning">Atenção</VidaBadge>
<VidaBadge variant="info">Info</VidaBadge>
```

### 🔘 **VidaButton** - Botões padrão
Botões com estilos VidaShield.

```tsx
<VidaButton variant="neon" onClick={handleClick}>
  Botão Neon
</VidaButton>
<VidaButton variant="badge">Botão Badge</VidaButton>
<VidaButton variant="secundario">Secundário</VidaButton>
<VidaButton variant="link">Link</VidaButton>
```

### 🔗 **VidaLink** - Links padrão
Links estilizados com ícones opcionais.

```tsx
<VidaLink to="/alertas" icon={<Eye className="w-4 h-4" />}>
  Ver todos
</VidaLink>
```

### 📜 **VidaScrollContainer** - Container com scroll
Para listas com scroll customizado.

```tsx
<VidaScrollContainer maxHeight="max-h-56">
  {items.map(item => <div key={item.id}>{item.name}</div>)}
</VidaScrollContainer>
```

### 🗂️ **VidaGrid** - Grid responsivo
Grid padronizado para layouts.

```tsx
<VidaGrid cols="4" gap="4">
  <VidaStatCard />
  <VidaStatCard />
  <VidaStatCard />
  <VidaStatCard />
</VidaGrid>
```

### 🔴 **VidaStatus** - Indicador de status
Para mostrar status com dot colorido.

```tsx
<VidaStatus status="online" text="Sistema Online" />
<VidaStatus status="offline" text="Offline" />
<VidaStatus status="warning" text="Atenção" />
```

### 📊 **VidaTrend** - Indicador de tendência
Para mostrar variações percentuais.

```tsx
<VidaTrend 
  value={15.2} 
  type="positive" 
  icon={<TrendingUp className="w-4 h-4" />}
/>
```

### 🔻 **VidaSeparator** - Separador
Linha divisória padrão.

```tsx
<VidaSeparator className="my-4" />
```

### 📭 **VidaEmptyState** - Estado vazio
Para quando não há dados para exibir.

```tsx
<VidaEmptyState
  icon={<CheckCircle />}
  title="Nenhum alerta"
  description="Sistema seguro"
  action={<VidaButton>Atualizar</VidaButton>}
/>
```

## 🎨 **Padrões Visuais**

### Classes CSS Disponíveis:
- `card-dark` - Container com background zinc-800 e shadow-glow-soft
- `shadow-glow-soft` - Efeito glow verde sutil
- `badge-ativo` - Badge verde (ativo)
- `badge-alerta` - Badge vermelho (crítico)
- `badge-pendente` - Badge amarelo (atenção)
- `badge-inativo` - Badge cinza (inativo)
- `btn-neon` - Botão com efeito neon
- `btn-badge` - Botão estilo badge
- `btn-secundario` - Botão secundário

### Cores Padrão:
- **Verde**: `text-green-400`, `bg-green-500/20` (principal)
- **Vermelho**: `text-red-400`, `bg-red-500/20` (crítico)
- **Amarelo**: `text-yellow-400`, `bg-yellow-500/20` (atenção)
- **Azul**: `text-blue-400`, `bg-blue-500/20` (info)
- **Zinco**: `text-zinc-400`, `bg-zinc-800` (neutro)

## ✅ **Exemplo Completo**

```tsx
import { 
  VidaWidget, 
  VidaInnerCard, 
  VidaBadge, 
  VidaScrollContainer,
  VidaEmptyState 
} from './ui/VidaShieldComponents';

const MeuWidget = () => {
  return (
    <VidaWidget
      title="Meu Widget"
      loading={false}
      error={null}
      fullHeight={true}
      actions={<VidaButton variant="link">Ver todos</VidaButton>}
    >
      <VidaScrollContainer>
        {dados.length > 0 ? (
          dados.map(item => (
            <VidaInnerCard key={item.id}>
              <div className="flex justify-between">
                <span>{item.nome}</span>
                <VidaBadge variant="success">Ativo</VidaBadge>
              </div>
            </VidaInnerCard>
          ))
        ) : (
          <VidaEmptyState
            title="Nenhum dado"
            description="Sem informações para exibir"
          />
        )}
      </VidaScrollContainer>
    </VidaWidget>
  );
};
```

## 🔧 **Como Usar**

1. **Importe** os componentes que precisa
2. **Use** os componentes com as props apropriadas
3. **Mantenha** o padrão visual consistente
4. **Aproveite** os estados automáticos (loading/error) do VidaWidget

Todos os componentes seguem o padrão visual do backup original! ✨ 