// Função principal para calcular preço por grama
function calcularPrecoPorGrama(precoPorKg, quantidadeGrams, kg = 1000) {
    return (precoPorKg * quantidadeGrams) / kg;
}

// Função para formatar valores monetários
function formatarMoeda(valor) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(valor);
}

// Função para formatar números com casas decimais
function formatarNumero(numero, casasDecimais = 2) {
    return numero.toFixed(casasDecimais);
}

// Função para adicionar item ao histórico
function adicionarAoHistorico(ingrediente, precoPorUnidade, quantidade, precoFinal, unidade) {
    const historico = JSON.parse(localStorage.getItem('calculadoraHistorico') || '[]');
    
    const novoItem = {
        id: Date.now(),
        ingrediente,
        precoPorUnidade,
        quantidade,
        precoFinal,
        unidade,
        data: new Date().toLocaleString('pt-BR')
    };
    
    historico.unshift(novoItem);
    
    // Manter apenas os últimos 20 itens
    if (historico.length > 20) {
        historico.splice(20);
    }
    
    localStorage.setItem('calculadoraHistorico', JSON.stringify(historico));
    atualizarHistorico();
}

// Função para atualizar a exibição do histórico
function atualizarHistorico() {
    const historico = JSON.parse(localStorage.getItem('calculadoraHistorico') || '[]');
    const historyList = document.getElementById('historyList');
    const clearBtn = document.getElementById('clearHistory');
    
    if (historico.length === 0) {
        historyList.innerHTML = '<p class="no-history">Nenhum cálculo realizado ainda</p>';
        clearBtn.style.display = 'none';
        return;
    }
    
    clearBtn.style.display = 'block';
    
    historyList.innerHTML = historico.map(item => `
        <div class="history-item">
            <div class="history-content">
                <h4>${item.ingrediente}</h4>
                <p>${formatarMoeda(item.precoPorUnidade)}/${item.unidade || 'kg'} → ${item.quantidade}g = ${formatarMoeda(item.precoFinal)}</p>
                <small>${item.data}</small>
            </div>
            <button class="remove-item" onclick="removerDoHistorico(${item.id})">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `).join('');
}

// Função para remover item do histórico
function removerDoHistorico(id) {
    const historico = JSON.parse(localStorage.getItem('calculadoraHistorico') || '[]');
    const novoHistorico = historico.filter(item => item.id !== id);
    localStorage.setItem('calculadoraHistorico', JSON.stringify(novoHistorico));
    atualizarHistorico();
}

// Função para limpar todo o histórico
function limparHistorico() {
    if (confirm('Tem certeza que deseja limpar todo o histórico?')) {
        localStorage.removeItem('calculadoraHistorico');
        atualizarHistorico();
    }
}

// Função para exibir resultado
function exibirResultado(ingrediente, precoPorUnidade, quantidade, precoFinal, unidade) {
    const resultSection = document.getElementById('result');
    const resultIngredient = document.getElementById('resultIngredient');
    const resultPricePerUnit = document.getElementById('resultPricePerUnit');
    const resultPriceLabel = document.getElementById('resultPriceLabel');
    const resultQuantity = document.getElementById('resultQuantity');
    const resultFinalPrice = document.getElementById('resultFinalPrice');
    
    resultIngredient.textContent = ingrediente;
    resultPricePerUnit.textContent = formatarMoeda(precoPorUnidade);
    resultPriceLabel.textContent = unidade === 'litro' ? 'Preço por litro:' : 'Preço por kg:';
    resultQuantity.textContent = `${quantidade}g`;
    resultFinalPrice.textContent = formatarMoeda(precoFinal);
    
    resultSection.style.display = 'block';
    resultSection.scrollIntoView({ behavior: 'smooth' });
}

// Função para carregar ingredientes salvos
function carregarIngredientesSalvos() {
    const ingredientes = JSON.parse(localStorage.getItem('ingredientesSalvos') || '[]');
    const container = document.getElementById('savedIngredients');
    
    if (ingredientes.length === 0) {
        // Ingredientes padrão
        const ingredientesPadrao = [
            { nome: 'Chocolate', preco: 29.00 },
            { nome: 'Manteiga/Margarina', preco: 17.50 },
            { nome: 'Açúcar', preco: 4.09 },
            { nome: 'Farinha de Trigo', preco: 4.60 },
            { nome: 'Cacau', preco: 19.80 },
            { nome: 'Leite em Pó', preco: 12.50 },
            { nome: 'Fermento', preco: 8.90 },
            { nome: 'Sal', preco: 2.50 }
        ];
        salvarIngredientes(ingredientesPadrao);
        carregarIngredientesSalvos();
        return;
    }
    
    container.innerHTML = ingredientes.map(ingrediente => `
        <div class="example-card" data-ingredient="${ingrediente.nome}" data-price="${ingrediente.preco}" data-unit="${ingrediente.unidade || 'kg'}">
            <h4>${ingrediente.nome}</h4>
            <p>Preço atual: ${formatarMoeda(ingrediente.preco)}/${ingrediente.unidade || 'kg'}</p>
            <div class="card-actions">
                <button class="example-btn">Usar este ingrediente</button>
                <button class="remove-ingredient-btn" onclick="removerIngrediente('${ingrediente.nome}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
    
    // Adicionar event listeners aos novos botões
    adicionarEventListenersIngredientes();
}

// Função para salvar ingredientes
function salvarIngredientes(ingredientes) {
    localStorage.setItem('ingredientesSalvos', JSON.stringify(ingredientes));
}

// Função para adicionar novo ingrediente
function adicionarIngrediente(nome, preco, unidade) {
    const ingredientes = JSON.parse(localStorage.getItem('ingredientesSalvos') || '[]');
    
    // Verificar se já existe
    const existe = ingredientes.find(ing => ing.nome.toLowerCase() === nome.toLowerCase());
    if (existe) {
        // Atualizar preço e unidade se já existe
        existe.preco = preco;
        existe.unidade = unidade;
        mostrarMensagem(`Preço do ingrediente "${nome}" atualizado!`, 'success');
    } else {
        // Adicionar novo ingrediente
        ingredientes.push({ nome, preco, unidade });
        mostrarMensagem(`Ingrediente "${nome}" salvo com sucesso!`, 'success');
    }
    
    salvarIngredientes(ingredientes);
    carregarIngredientesSalvos();
}

// Função para remover ingrediente
function removerIngrediente(nome) {
    if (confirm(`Tem certeza que deseja remover "${nome}" dos ingredientes salvos?`)) {
        const ingredientes = JSON.parse(localStorage.getItem('ingredientesSalvos') || '[]');
        const novosIngredientes = ingredientes.filter(ing => ing.nome !== nome);
        salvarIngredientes(novosIngredientes);
        carregarIngredientesSalvos();
        mostrarMensagem(`Ingrediente "${nome}" removido!`, 'info');
    }
}

// Função para usar ingrediente pré-salvo
function usarIngredientePreSalvo(nome, preco, unidade) {
    document.getElementById('ingredientName').value = nome;
    document.getElementById('pricePerUnit').value = preco;
    document.getElementById('unitType').value = unidade;
    document.getElementById('quantityGrams').value = ''; // Deixa vazio para o usuário preencher
    
    // Atualizar labels baseado na unidade
    atualizarLabelsUnidade(unidade);
    
    // Focar no campo de quantidade
    document.getElementById('quantityGrams').focus();
    
    // Mostrar mensagem de sucesso
    mostrarMensagem(`Ingrediente "${nome}" selecionado! Agora digite a quantidade em gramas.`, 'success');
}

// Função para adicionar event listeners aos ingredientes
function adicionarEventListenersIngredientes() {
    const exampleButtons = document.querySelectorAll('.example-btn');
    exampleButtons.forEach(button => {
        button.addEventListener('click', function() {
            const card = this.closest('.example-card');
            const preco = parseFloat(card.dataset.price);
            const nome = card.dataset.ingredient;
            const unidade = card.dataset.unit || 'kg';
            
            usarIngredientePreSalvo(nome, preco, unidade);
        });
    });
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('priceCalculator');
    const clearHistoryBtn = document.getElementById('clearHistory');
    const saveIngredientBtn = document.getElementById('saveIngredient');
    
    // Carregar ingredientes salvos e histórico ao inicializar
    carregarIngredientesSalvos();
    atualizarHistorico();
    
    // Event listener para o formulário
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const ingrediente = document.getElementById('ingredientName').value.trim();
        const precoPorUnidade = parseFloat(document.getElementById('pricePerUnit').value);
        const quantidade = parseInt(document.getElementById('quantityGrams').value);
        const unidade = document.getElementById('unitType').value;
        
        if (!ingrediente || isNaN(precoPorUnidade) || isNaN(quantidade)) {
            alert('Por favor, preencha todos os campos corretamente.');
            return;
        }
        
        if (precoPorUnidade <= 0 || quantidade <= 0) {
            alert('Os valores devem ser maiores que zero.');
            return;
        }
        
        const precoFinal = calcularPrecoPorGrama(precoPorUnidade, quantidade);
        
        exibirResultado(ingrediente, precoPorUnidade, quantidade, precoFinal, unidade);
        adicionarAoHistorico(ingrediente, precoPorUnidade, quantidade, precoFinal, unidade);
        
        // Atualizar preço do ingrediente se já existir nos salvos
        atualizarPrecoIngrediente(ingrediente, precoPorUnidade, unidade);
    });
    
    // Event listener para salvar ingrediente
    saveIngredientBtn.addEventListener('click', function() {
        const ingrediente = document.getElementById('ingredientName').value.trim();
        const precoPorUnidade = parseFloat(document.getElementById('pricePerUnit').value);
        const unidade = document.getElementById('unitType').value;
        
        if (!ingrediente || isNaN(precoPorUnidade)) {
            alert('Por favor, preencha o nome e preço do ingrediente.');
            return;
        }
        
        adicionarIngrediente(ingrediente, precoPorUnidade, unidade);
    });
    
    // Event listener para mudança de unidade
    document.getElementById('unitType').addEventListener('change', function() {
        atualizarLabelsUnidade(this.value);
    });
    
    // Mostrar/ocultar botão de salvar baseado no nome do ingrediente
    document.getElementById('ingredientName').addEventListener('input', function() {
        const nome = this.value.trim();
        const ingredientes = JSON.parse(localStorage.getItem('ingredientesSalvos') || '[]');
        const existe = ingredientes.find(ing => ing.nome.toLowerCase() === nome.toLowerCase());
        
        if (nome && !existe) {
            saveIngredientBtn.style.display = 'inline-flex';
        } else {
            saveIngredientBtn.style.display = 'none';
        }
    });
    
    // Event listener para limpar histórico
    clearHistoryBtn.addEventListener('click', limparHistorico);
    
    // Validação em tempo real dos inputs
    const inputs = document.querySelectorAll('input[type="number"]');
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            if (this.value < 0) {
                this.value = 0;
            }
        });
    });
});

// Função para atualizar preço de ingrediente existente
function atualizarPrecoIngrediente(nome, novoPreco, unidade) {
    const ingredientes = JSON.parse(localStorage.getItem('ingredientesSalvos') || '[]');
    const ingrediente = ingredientes.find(ing => ing.nome.toLowerCase() === nome.toLowerCase());
    
    if (ingrediente) {
        ingrediente.preco = novoPreco;
        ingrediente.unidade = unidade;
        salvarIngredientes(ingredientes);
        carregarIngredientesSalvos();
    }
}

// Função para atualizar labels baseado na unidade
function atualizarLabelsUnidade(unidade) {
    const priceLabel = document.getElementById('priceLabel');
    const quantityLabel = document.getElementById('quantityLabel');
    
    if (unidade === 'litro') {
        priceLabel.textContent = 'Preço por Litro (R$)';
        quantityLabel.textContent = 'Quantidade em Gramas';
    } else {
        priceLabel.textContent = 'Preço por Quilo (R$)';
        quantityLabel.textContent = 'Quantidade em Gramas';
    }
}

// Função para mostrar mensagens de feedback
function mostrarMensagem(texto, tipo = 'info') {
    // Remove mensagem anterior se existir
    const mensagemAnterior = document.querySelector('.mensagem-feedback');
    if (mensagemAnterior) {
        mensagemAnterior.remove();
    }
    
    const mensagem = document.createElement('div');
    mensagem.className = `mensagem-feedback mensagem-${tipo}`;
    mensagem.innerHTML = `
        <i class="fas fa-${tipo === 'success' ? 'check-circle' : 'info-circle'}"></i>
        <span>${texto}</span>
    `;
    
    // Adicionar ao topo do formulário
    const form = document.getElementById('priceCalculator');
    form.insertBefore(mensagem, form.firstChild);
    
    // Remover após 3 segundos
    setTimeout(() => {
        if (mensagem.parentNode) {
            mensagem.remove();
        }
    }, 3000);
}

// Função para exportar histórico (funcionalidade extra)
function exportarHistorico() {
    const historico = JSON.parse(localStorage.getItem('calculadoraHistorico') || '[]');
    
    if (historico.length === 0) {
        alert('Nenhum item no histórico para exportar.');
        return;
    }
    
    const csvContent = [
        'Ingrediente,Preço por kg,Quantidade (g),Preço Final,Data',
        ...historico.map(item => 
            `"${item.ingrediente}",${item.precoPorKg},${item.quantidade},${item.precoFinal},"${item.data}"`
        )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `historico_calculadora_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
