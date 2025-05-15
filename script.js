// Dados iniciais (simulando um banco de dados)
        let db = {
            sales: [],
            customers: [],
            products: [
                { id: 1, name: "iPhone 13", quantity: 5, idealQuantity: 10, cost: 4000, price: 5000 },
                { id: 2, name: "Samsung Galaxy S21", quantity: 3, idealQuantity: 8, cost: 3500, price: 4500 },
                { id: 3, name: "Capa iPhone 13", quantity: 15, idealQuantity: 20, cost: 50, price: 120 },
                { id: 4, name: "Película Vidro", quantity: 25, idealQuantity: 30, cost: 10, price: 40 },
                { id: 5, name: "Carregador USB-C", quantity: 8, idealQuantity: 15, cost: 30, price: 80 }
            ],
            serviceOrders: []
        };

        // Carregar dados do localStorage se existirem
        function loadData() {
            const savedData = localStorage.getItem('pdv-database');
            if (savedData) {
                db = JSON.parse(savedData);
                // Ordenar vendas por data (mais recente primeiro)
                db.sales.sort((a, b) => new Date(b.date) - new Date(a.date));
                // Ordenar clientes por nome (A-Z)
                db.customers.sort((a, b) => a.name.localeCompare(b.name));
            }
        }

        // Salvar dados no localStorage
        function saveData() {
            localStorage.setItem('pdv-database', JSON.stringify(db));
        }

        // Inicializar dados
        loadData();

        // Funções auxiliares
        function formatCurrency(value) {
            return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
        }

        function formatDate(date) {
            return new Date(date).toLocaleDateString('pt-BR');
        }

        function formatDateTime(date) {
            return new Date(date).toLocaleString('pt-BR');
        }

        function generateId() {
            return Math.floor(Math.random() * 1000000);
        }

        // Formatar telefone
        function formatPhone(phone) {
            if (!phone) return '';
            // Remove tudo que não é dígito
            const cleaned = phone.replace(/\D/g, '');
            // Aplica a formatação
            const match = cleaned.match(/^(\d{2})(\d{5})(\d{4})$/);
            if (match) {
                return `(${match[1]}) ${match[2]}-${match[3]}`;
            }
            return phone;
        }

        // Formatar CPF
        function formatCPF(cpf) {
            if (!cpf) return '';
            // Remove tudo que não é dígito
            const cleaned = cpf.replace(/\D/g, '');
            // Aplica a formatação
            const match = cleaned.match(/^(\d{3})(\d{3})(\d{3})(\d{2})$/);
            if (match) {
                return `${match[1]}.${match[2]}.${match[3]}-${match[4]}`;
            }
            return cpf;
        }

        // Máscara para telefone
        function applyPhoneMask(input) {
            input.addEventListener('input', function(e) {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length > 11) value = value.substring(0, 11);
                
                if (value.length > 0) {
                    value = `(${value.substring(0, 2)}) ${value.substring(2, 7)}-${value.substring(7, 11)}`;
                }
                
                e.target.value = value;
            });
        }

        // Máscara para CPF
        function applyCPFMask(input) {
            input.addEventListener('input', function(e) {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length > 11) value = value.substring(0, 11);
                
                if (value.length > 0) {
                    value = `${value.substring(0, 3)}.${value.substring(3, 6)}.${value.substring(6, 9)}-${value.substring(9, 11)}`;
                }
                
                e.target.value = value;
            });
        }

        // Navegação entre seções
        document.querySelectorAll('.sidebar-menu a').forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Remover classe active de todos os links
                document.querySelectorAll('.sidebar-menu a').forEach(item => {
                    item.classList.remove('active');
                });
                
                // Adicionar classe active ao link clicado
                this.classList.add('active');
                
                // Esconder todas as seções
                document.querySelectorAll('section').forEach(section => {
                    section.style.display = 'none';
                });
                
                // Mostrar a seção correspondente
                const sectionId = this.getAttribute('data-section') + '-section';
                document.getElementById(sectionId).style.display = 'block';
                
                // Atualizar dados da seção
                updateSectionData(this.getAttribute('data-section'));
            });
        });

        // Atualizar dados da seção
        function updateSectionData(section) {
            switch(section) {
                case 'dashboard':
                    updateDashboard();
                    break;
                case 'sales':
                    updateSalesSection();
                    break;
                case 'customers':
                    updateCustomersSection();
                    break;
                case 'products':
                    updateProductsSection();
                    break;
                case 'service-orders':
                    updateServiceOrdersSection();
                    break;
            }
        }

        // Dashboard
        function updateDashboard() {
            // Atualizar cards
            const today = new Date().toISOString().split('T')[0];
            const month = new Date().getMonth() + 1;
            const year = new Date().getFullYear();
            
            const todaySales = db.sales.filter(sale => sale.date.includes(today));
            const monthSales = db.sales.filter(sale => {
                const saleDate = new Date(sale.date);
                return saleDate.getMonth() + 1 === month && saleDate.getFullYear() === year;
            });
            
            const todaySalesAmount = todaySales.reduce((total, sale) => total + sale.total, 0);
            const todayProfitAmount = todaySales.reduce((total, sale) => total + sale.profit, 0);
            const monthSalesAmount = monthSales.reduce((total, sale) => total + sale.total, 0);
            const monthProfitAmount = monthSales.reduce((total, sale) => total + sale.profit, 0);
            
            document.getElementById('today-sales-amount').textContent = formatCurrency(todaySalesAmount);
            document.getElementById('today-profit-amount').textContent = formatCurrency(todayProfitAmount);
            document.getElementById('month-sales-amount').textContent = formatCurrency(monthSalesAmount);
            document.getElementById('month-profit-amount').textContent = formatCurrency(monthProfitAmount);
            
            // Atualizar gráfico
            updateSalesChart('day');
            
            // Atualizar tabela de vendas recentes
            const recentSalesTable = document.getElementById('recent-sales-table').querySelector('tbody');
            recentSalesTable.innerHTML = '';
            
            const recentSales = db.sales.slice(0, 5);
            recentSales.forEach(sale => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${sale.id}</td>
                    <td>${formatDateTime(sale.date)}</td>
                    <td>${sale.customer ? sale.customer.name : 'Consumidor Final'}</td>
                    <td>${formatCurrency(sale.total)}</td>
                    <td><span class="status completed">Concluída</span></td>
                    <td>
                        <button class="action-btn edit" data-id="${sale.id}"><i class="fas fa-eye"></i></button>
                        <button class="action-btn delete" data-id="${sale.id}"><i class="fas fa-trash"></i></button>
                    </td>
                `;
                recentSalesTable.appendChild(row);
            });

            // Adicionar eventos para editar/excluir vendas
            document.querySelectorAll('#recent-sales-table .action-btn.edit').forEach(btn => {
                btn.addEventListener('click', function() {
                    const saleId = parseInt(this.getAttribute('data-id'));
                    const sale = db.sales.find(s => s.id === saleId);
                    if (sale) {
                        showReceipt(sale);
                    }
                });
            });

            document.querySelectorAll('#recent-sales-table .action-btn.delete').forEach(btn => {
                btn.addEventListener('click', function() {
                    const saleId = parseInt(this.getAttribute('data-id'));
                    if (confirm('Tem certeza que deseja excluir esta venda?')) {
                        db.sales = db.sales.filter(s => s.id !== saleId);
                        saveData();
                        updateDashboard();
                    }
                });
            });
        }

        // Gráfico de vendas
        let salesChart;
        function updateSalesChart(period) {
            const ctx = document.getElementById('salesChart').getContext('2d');
            
            // Dados fictícios para demonstração
            let labels, salesData, profitData;
            
            if (period === 'day') {
                labels = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'];
                salesData = [500, 1200, 800, 1500, 2000, 1800, 1000];
                profitData = [200, 500, 300, 600, 800, 700, 400];
            } else if (period === 'week') {
                labels = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
                salesData = [3500, 4200, 3800, 4500, 5000, 6000, 4000];
                profitData = [1400, 1700, 1500, 1800, 2000, 2400, 1600];
            } else {
                labels = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'];
                salesData = [15000, 18000, 20000, 22000];
                profitData = [6000, 7200, 8000, 8800];
            }
            
            if (salesChart) {
                salesChart.destroy();
            }
            
            salesChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: 'Vendas',
                            data: salesData,
                            borderColor: '#4361ee',
                            backgroundColor: 'rgba(67, 97, 238, 0.1)',
                            tension: 0.4,
                            fill: true
                        },
                        {
                            label: 'Lucro',
                            data: profitData,
                            borderColor: '#4cc9f0',
                            backgroundColor: 'rgba(76, 201, 240, 0.1)',
                            tension: 0.4,
                            fill: true
                        }
                    ]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'top',
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return `${context.dataset.label}: ${formatCurrency(context.raw)}`;
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: function(value) {
                                    return formatCurrency(value);
                                }
                            }
                        }
                    }
                }
            });
        }

        // Filtros do gráfico
        document.querySelectorAll('.chart-filters button').forEach(button => {
            button.addEventListener('click', function() {
                document.querySelectorAll('.chart-filters button').forEach(btn => {
                    btn.classList.remove('active');
                });
                this.classList.add('active');
                updateSalesChart(this.getAttribute('data-period'));
            });
        });

        // Seção de Vendas
        let currentCart = {
            items: [],
            discount: 0,
            paymentMethod: 'Dinheiro',
            customer: null
        };

        function updateSalesSection() {
            // Atualizar lista de produtos
            const productsList = document.getElementById('products-list-container');
            productsList.innerHTML = '';
            
            db.products.forEach(product => {
                const productItem = document.createElement('div');
                productItem.className = 'product-item';
                productItem.setAttribute('data-id', product.id);
                productItem.innerHTML = `
                    <div class="product-info">
                        <h4>${product.name}</h4>
                        <p>Estoque: ${product.quantity}</p>
                    </div>
                    <div class="product-price">${formatCurrency(product.price)}</div>
                `;
                productsList.appendChild(productItem);
                
                // Adicionar evento de clique para adicionar ao carrinho
                productItem.addEventListener('click', function() {
                    addToCart(product);
                });
            });
            
            // Atualizar carrinho
            updateCart();
            
            // Busca de produtos
            document.getElementById('product-search').addEventListener('input', function() {
                const searchTerm = this.value.toLowerCase();
                document.querySelectorAll('.product-item').forEach(item => {
                    const productName = item.querySelector('h4').textContent.toLowerCase();
                    if (productName.includes(searchTerm)) {
                        item.style.display = 'flex';
                    } else {
                        item.style.display = 'none';
                    }
                });
            });
            
            // Busca de clientes
            document.getElementById('customer-search').addEventListener('input', function() {
                const searchTerm = this.value.toLowerCase();
                const resultsContainer = document.getElementById('customer-search-results');
                
                if (searchTerm.length < 2) {
                    resultsContainer.style.display = 'none';
                    return;
                }
                
                const filteredCustomers = db.customers.filter(customer => 
                    customer.name.toLowerCase().includes(searchTerm) || 
                    (customer.phone && customer.phone.includes(searchTerm)) ||
                    (customer.cpf && customer.cpf.includes(searchTerm))
                );
                
                if (filteredCustomers.length > 0) {
                    resultsContainer.innerHTML = '';
                    filteredCustomers.forEach(customer => {
                        const div = document.createElement('div');
                        div.className = 'product-item';
                        div.style.padding = '10px';
                        div.style.cursor = 'pointer';
                        div.innerHTML = `
                            <div class="product-info">
                                <h4>${customer.name}</h4>
                                <p>${customer.phone || ''} ${customer.cpf || ''}</p>
                            </div>
                        `;
                        div.addEventListener('click', function() {
                            currentCart.customer = customer;
                            document.getElementById('customer-search').value = customer.name;
                            resultsContainer.style.display = 'none';
                        });
                        resultsContainer.appendChild(div);
                    });
                    resultsContainer.style.display = 'block';
                } else {
                    resultsContainer.innerHTML = '<div style="padding: 10px;">Nenhum cliente encontrado</div>';
                    resultsContainer.style.display = 'block';
                }
            });
            
            // Novo cliente
            document.getElementById('new-customer-btn').addEventListener('click', function() {
                document.getElementById('new-customer-modal').style.display = 'flex';
                document.getElementById('customer-name').value = '';
                document.getElementById('customer-phone').value = '';
                document.getElementById('customer-cpf').value = '';
                document.getElementById('customer-notes').value = '';
            });
            
            // Aplicar máscaras aos campos de telefone e CPF
            applyPhoneMask(document.getElementById('customer-phone'));
            applyCPFMask(document.getElementById('customer-cpf'));
            
            // Fechar modal
            document.querySelectorAll('.modal-close').forEach(button => {
                button.addEventListener('click', function() {
                    this.closest('.modal').style.display = 'none';
                });
            });
            
            // Salvar cliente
            document.getElementById('save-customer').addEventListener('click', function() {
                const name = document.getElementById('customer-name').value;
                const phone = document.getElementById('customer-phone').value;
                const cpf = document.getElementById('customer-cpf').value;
                const notes = document.getElementById('customer-notes').value;
                
                if (!name) {
                    alert('Por favor, informe o nome do cliente');
                    return;
                }
                
                const newCustomer = {
                    id: generateId(),
                    name,
                    phone,
                    cpf,
                    notes,
                    purchases: [],
                    serviceOrders: []
                };
                
                db.customers.push(newCustomer);
                saveData();
                
                // Limpar formulário
                document.getElementById('customer-name').value = '';
                document.getElementById('customer-phone').value = '';
                document.getElementById('customer-cpf').value = '';
                document.getElementById('customer-notes').value = '';
                
                // Fechar modal
                document.getElementById('new-customer-modal').style.display = 'none';
                
                // Atualizar cliente no carrinho
                currentCart.customer = newCustomer;
                document.getElementById('customer-search').value = newCustomer.name;
                
                alert('Cliente cadastrado com sucesso!');
            });
            
            // Aplicar desconto
            document.getElementById('apply-discount').addEventListener('click', function() {
                const discountInput = document.getElementById('discount-input').value;
                const discount = parseFloat(discountInput.replace(',', '.')) || 0;
                
                if (discount < 0) {
                    alert('O desconto não pode ser negativo');
                    return;
                }
                
                currentCart.discount = discount;
                updateCart();
            });
            
            // Finalizar venda
            document.getElementById('complete-sale').addEventListener('click', function() {
                if (currentCart.items.length === 0) {
                    alert('Adicione produtos ao carrinho antes de finalizar a venda');
                    return;
                }
                
                const total = currentCart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                const discount = currentCart.discount;
                const finalTotal = total - discount;
                const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
                
                // Calcular lucro
                const profit = currentCart.items.reduce((sum, item) => {
                    const product = db.products.find(p => p.id === item.id);
                    return sum + ((item.price - product.cost) * item.quantity);
                }, 0) - discount;
                
                // Criar venda
                const newSale = {
                    id: generateId(),
                    date: new Date().toISOString(),
                    items: [...currentCart.items],
                    total: finalTotal,
                    discount,
                    paymentMethod,
                    profit,
                    customer: currentCart.customer
                };
                
                // Adicionar ao banco de dados
                db.sales.unshift(newSale); // Adiciona no início para ordenação
                
                // Atualizar estoque
                newSale.items.forEach(item => {
                    const product = db.products.find(p => p.id === item.id);
                    if (product) {
                        product.quantity -= item.quantity;
                    }
                });
                
                // Adicionar ao histórico do cliente
                if (currentCart.customer) {
                    const customer = db.customers.find(c => c.id === currentCart.customer.id);
                    if (customer) {
                        customer.purchases.unshift({
                            id: newSale.id,
                            date: newSale.date,
                            total: newSale.total,
                            paymentMethod: newSale.paymentMethod
                        });
                    }
                }
                
                saveData();
                
                // Limpar carrinho
                currentCart = {
                    items: [],
                    discount: 0,
                    paymentMethod: 'Dinheiro',
                    customer: null
                };
                
                updateCart();
                document.getElementById('customer-search').value = '';
                document.getElementById('discount-input').value = '';
                
                // Mostrar recibo
                showReceipt(newSale);
            });
        }

        // Adicionar produto ao carrinho
        function addToCart(product) {
            const existingItem = currentCart.items.find(item => item.id === product.id);
            
            if (existingItem) {
                if (existingItem.quantity < product.quantity) {
                    existingItem.quantity += 1;
                } else {
                    alert('Quantidade em estoque insuficiente');
                }
            } else {
                if (product.quantity > 0) {
                    currentCart.items.push({
                        id: product.id,
                        name: product.name,
                        price: product.price,
                        quantity: 1
                    });
                } else {
                    alert('Produto sem estoque disponível');
                }
            }
            
            updateCart();
        }

        // Atualizar carrinho
        function updateCart() {
            const cartItems = document.getElementById('cart-items');
            cartItems.innerHTML = '';
            
            currentCart.items.forEach(item => {
                const product = db.products.find(p => p.id === item.id);
                
                const cartItem = document.createElement('div');
                cartItem.className = 'cart-item';
                cartItem.innerHTML = `
                    <div class="cart-item-info">
                        <span>${item.name}</span>
                        <button class="btn btn-secondary" onclick="decreaseQuantity(${item.id})">-</button>
                        <span class="cart-item-quantity">${item.quantity}</span>
                        <button class="btn btn-secondary" onclick="increaseQuantity(${item.id})">+</button>
                    </div>
                    <div class="cart-item-price">${formatCurrency(item.price * item.quantity)}</div>
                    <i class="fas fa-times cart-item-remove" onclick="removeFromCart(${item.id})"></i>
                `;
                cartItems.appendChild(cartItem);
            });
            
            const total = currentCart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const finalTotal = total - currentCart.discount;
            
            document.getElementById('cart-total').textContent = formatCurrency(finalTotal);
        }

        // Funções globais para manipulação do carrinho
        window.increaseQuantity = function(productId) {
            const item = currentCart.items.find(item => item.id === productId);
            const product = db.products.find(p => p.id === productId);
            
            if (item && product) {
                if (item.quantity < product.quantity) {
                    item.quantity += 1;
                    updateCart();
                } else {
                    alert('Quantidade em estoque insuficiente');
                }
            }
        };

        window.decreaseQuantity = function(productId) {
            const item = currentCart.items.find(item => item.id === productId);
            
            if (item) {
                if (item.quantity > 1) {
                    item.quantity -= 1;
                } else {
                    removeFromCart(productId);
                }
                updateCart();
            }
        };

        window.removeFromCart = function(productId) {
            currentCart.items = currentCart.items.filter(item => item.id !== productId);
            updateCart();
        };

        // Mostrar recibo
        function showReceipt(sale) {
            document.getElementById('receipt-id').textContent = sale.id;
            document.getElementById('receipt-date').textContent = formatDateTime(sale.date);
            document.getElementById('receipt-customer').textContent = sale.customer ? sale.customer.name : 'Consumidor Final';
            document.getElementById('receipt-payment').textContent = sale.paymentMethod;
            
            const receiptItems = document.getElementById('receipt-items');
            receiptItems.innerHTML = '';
            
            sale.items.forEach(item => {
                const itemRow = document.createElement('div');
                itemRow.className = 'receipt-item';
                itemRow.innerHTML = `
                    <span>${item.quantity}x ${item.name}</span>
                    <span>${formatCurrency(item.price * item.quantity)}</span>
                `;
                receiptItems.appendChild(itemRow);
            });
            
            if (sale.discount > 0) {
                const discountRow = document.createElement('div');
                discountRow.className = 'receipt-item';
                discountRow.innerHTML = `
                    <span>Desconto</span>
                    <span>-${formatCurrency(sale.discount)}</span>
                `;
                receiptItems.appendChild(discountRow);
            }
            
            document.getElementById('receipt-total').textContent = formatCurrency(sale.total);
            
            // Mostrar modal
            document.getElementById('receipt-modal').style.display = 'flex';
        }

        // Imprimir recibo
        document.getElementById('print-receipt').addEventListener('click', function() {
            const printContent = document.getElementById('receipt-content').innerHTML;
            const originalContent = document.body.innerHTML;
            
            document.body.innerHTML = printContent;
            window.print();
            document.body.innerHTML = originalContent;
            
            // Recarregar eventos
            updateSalesSection();
        });

        // Seção de Clientes
        function updateCustomersSection() {
            // Atualizar tabela de clientes
            const customersTable = document.getElementById('customers-table').querySelector('tbody');
            customersTable.innerHTML = '';
            
            db.customers.forEach(customer => {
                const totalPurchases = customer.purchases ? customer.purchases.reduce((total, purchase) => total + purchase.total, 0) : 0;
                
                const row = document.createElement('tr');
                row.setAttribute('data-id', customer.id);
                row.innerHTML = `
                    <td>${customer.name}</td>
                    <td>${customer.phone ? formatPhone(customer.phone) : '-'}</td>
                    <td>${customer.cpf ? formatCPF(customer.cpf) : '-'}</td>
                    <td>${formatCurrency(totalPurchases)}</td>
                    <td>
                        <button class="action-btn edit" data-id="${customer.id}"><i class="fas fa-edit"></i></button>
                        <button class="action-btn delete" data-id="${customer.id}"><i class="fas fa-trash"></i></button>
                    </td>
                `;
                customersTable.appendChild(row);
            });
            
            // Busca de clientes
            document.getElementById('customer-table-search').addEventListener('input', function() {
                const searchTerm = this.value.toLowerCase();
                document.querySelectorAll('#customers-table tbody tr').forEach(row => {
                    const customerName = row.querySelector('td:first-child').textContent.toLowerCase();
                    if (customerName.includes(searchTerm)) {
                        row.style.display = '';
                    } else {
                        row.style.display = 'none';
                    }
                });
            });
            
            // Adicionar cliente
            document.getElementById('add-customer-btn').addEventListener('click', function() {
                document.getElementById('new-customer-modal').style.display = 'flex';
                document.getElementById('customer-name').value = '';
                document.getElementById('customer-phone').value = '';
                document.getElementById('customer-cpf').value = '';
                document.getElementById('customer-notes').value = '';
            });
            
            // Editar cliente
            document.querySelectorAll('#customers-table .action-btn.edit').forEach(button => {
                button.addEventListener('click', function() {
                    const customerId = parseInt(this.getAttribute('data-id'));
                    const customer = db.customers.find(c => c.id === customerId);
                    
                    if (customer) {
                        showCustomerDetails(customer);
                    }
                });
            });
            
            // Excluir cliente
            document.querySelectorAll('#customers-table .action-btn.delete').forEach(button => {
                button.addEventListener('click', function() {
                    const customerId = parseInt(this.getAttribute('data-id'));
                    
                    if (confirm('Tem certeza que deseja excluir este cliente?')) {
                        db.customers = db.customers.filter(c => c.id !== customerId);
                        saveData();
                        updateCustomersSection();
                    }
                });
            });
        }

        // Mostrar detalhes do cliente
        function showCustomerDetails(customer) {
            document.getElementById('edit-customer-name').value = customer.name;
            document.getElementById('edit-customer-phone').value = customer.phone ? formatPhone(customer.phone) : '';
            document.getElementById('edit-customer-cpf').value = customer.cpf ? formatCPF(customer.cpf) : '';
            document.getElementById('edit-customer-notes').value = customer.notes || '';
            
            // Aplicar máscaras aos campos de edição
            applyPhoneMask(document.getElementById('edit-customer-phone'));
            applyCPFMask(document.getElementById('edit-customer-cpf'));
            
            // Atualizar histórico de compras
            const purchasesList = document.getElementById('customer-purchases-list');
            purchasesList.innerHTML = '';
            
            if (customer.purchases && customer.purchases.length > 0) {
                customer.purchases.forEach(purchase => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${formatDate(purchase.date)}</td>
                        <td>${purchase.id}</td>
                        <td>${formatCurrency(purchase.total)}</td>
                        <td>${purchase.paymentMethod}</td>
                    `;
                    purchasesList.appendChild(row);
                });
            } else {
                purchasesList.innerHTML = '<tr><td colspan="4" style="text-align: center;">Nenhuma compra registrada</td></tr>';
            }
            
            // Atualizar histórico de serviços
            const servicesList = document.getElementById('customer-services-list');
            servicesList.innerHTML = '';
            
            if (customer.serviceOrders && customer.serviceOrders.length > 0) {
                customer.serviceOrders.forEach(service => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${formatDate(service.date)}</td>
                        <td>${service.id}</td>
                        <td>${service.problem.substring(0, 30)}...</td>
                        <td>${formatCurrency(service.estimatedValue)}</td>
                        <td><span class="status ${service.status === 'completed' ? 'completed' : service.status === 'canceled' ? 'canceled' : 'pending'}">
                            ${service.status === 'completed' ? 'Concluído' : service.status === 'canceled' ? 'Cancelado' : 'Pendente'}
                        </span></td>
                    `;
                    servicesList.appendChild(row);
                });
            } else {
                servicesList.innerHTML = '<tr><td colspan="5" style="text-align: center;">Nenhuma ordem de serviço registrada</td></tr>';
            }
            
            // Abrir modal
            const modal = document.getElementById('customer-details-modal');
            modal.style.display = 'flex';
            modal.setAttribute('data-customer-id', customer.id);
            
            // Tabs
            document.querySelectorAll('#customer-details-modal .tab').forEach(tab => {
                tab.addEventListener('click', function() {
                    document.querySelectorAll('#customer-details-modal .tab').forEach(t => t.classList.remove('active'));
                    document.querySelectorAll('#customer-details-modal .tab-content').forEach(c => c.style.display = 'none');
                    
                    this.classList.add('active');
                    const tabId = this.getAttribute('data-tab');
                    document.getElementById(`customer-tab-${tabId}`).style.display = 'block';
                });
            });
            
            // Atualizar cliente
            document.getElementById('update-customer-btn').addEventListener('click', function() {
                const customerId = parseInt(modal.getAttribute('data-customer-id'));
                const customer = db.customers.find(c => c.id === customerId);
                
                if (customer) {
                    customer.name = document.getElementById('edit-customer-name').value;
                    customer.phone = document.getElementById('edit-customer-phone').value;
                    customer.cpf = document.getElementById('edit-customer-cpf').value;
                    customer.notes = document.getElementById('edit-customer-notes').value;
                    
                    saveData();
                    updateCustomersSection();
                    modal.style.display = 'none';
                    alert('Cliente atualizado com sucesso!');
                }
            });
            
            // Excluir cliente
            document.getElementById('delete-customer-btn').addEventListener('click', function() {
                const customerId = parseInt(modal.getAttribute('data-customer-id'));
                
                if (confirm('Tem certeza que deseja excluir este cliente?')) {
                    db.customers = db.customers.filter(c => c.id !== customerId);
                    saveData();
                    updateCustomersSection();
                    modal.style.display = 'none';
                }
            });
        }

        // Seção de Produtos
        function updateProductsSection() {
            // Atualizar tabela de produtos
            const productsTable = document.getElementById('products-table').querySelector('tbody');
            productsTable.innerHTML = '';
            
            db.products.forEach(product => {
                const row = document.createElement('tr');
                row.setAttribute('data-id', product.id);
                row.innerHTML = `
                    <td>${product.name}</td>
                    <td>${product.quantity}</td>
                    <td>${product.idealQuantity}</td>
                    <td>${formatCurrency(product.cost)}</td>
                    <td>${formatCurrency(product.price)}</td>
                    <td>
                        <button class="action-btn edit" data-id="${product.id}"><i class="fas fa-edit"></i></button>
                        <button class="action-btn delete" data-id="${product.id}"><i class="fas fa-trash"></i></button>
                    </td>
                `;
                productsTable.appendChild(row);
            });
            
            // Atualizar tabela de estoque baixo
            const lowStockTable = document.getElementById('low-stock-table').querySelector('tbody');
            lowStockTable.innerHTML = '';
            
            const lowStockProducts = db.products.filter(product => product.quantity < product.idealQuantity);
            
            if (lowStockProducts.length > 0) {
                lowStockProducts.forEach(product => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${product.name}</td>
                        <td>${product.quantity}</td>
                        <td>${product.idealQuantity}</td>
                        <td>${product.idealQuantity - product.quantity}</td>
                    `;
                    lowStockTable.appendChild(row);
                });
            } else {
                lowStockTable.innerHTML = '<tr><td colspan="4" style="text-align: center;">Nenhum produto com estoque baixo</td></tr>';
            }
            
            // Busca de produtos
            document.getElementById('product-table-search').addEventListener('input', function() {
                const searchTerm = this.value.toLowerCase();
                document.querySelectorAll('#products-table tbody tr').forEach(row => {
                    const productName = row.querySelector('td:first-child').textContent.toLowerCase();
                    if (productName.includes(searchTerm)) {
                        row.style.display = '';
                    } else {
                        row.style.display = 'none';
                    }
                });
            });
            
            // Adicionar produto
            document.getElementById('add-product-btn').addEventListener('click', function() {
                document.getElementById('product-modal-title').textContent = 'Adicionar Produto';
                document.getElementById('product-name').value = '';
                document.getElementById('product-quantity').value = '';
                document.getElementById('product-ideal-quantity').value = '';
                document.getElementById('product-cost').value = '';
                document.getElementById('product-price').value = '';
                document.getElementById('product-modal').setAttribute('data-mode', 'add');
                document.getElementById('product-modal').style.display = 'flex';
            });
            
            // Editar produto
            document.querySelectorAll('#products-table .action-btn.edit').forEach(button => {
                button.addEventListener('click', function() {
                    const productId = parseInt(this.getAttribute('data-id'));
                    const product = db.products.find(p => p.id === productId);
                    
                    if (product) {
                        document.getElementById('product-modal-title').textContent = 'Editar Produto';
                        document.getElementById('product-name').value = product.name;
                        document.getElementById('product-quantity').value = product.quantity;
                        document.getElementById('product-ideal-quantity').value = product.idealQuantity;
                        document.getElementById('product-cost').value = formatCurrency(product.cost);
                        document.getElementById('product-price').value = formatCurrency(product.price);
                        document.getElementById('product-modal').setAttribute('data-product-id', product.id);
                        document.getElementById('product-modal').setAttribute('data-mode', 'edit');
                        document.getElementById('product-modal').style.display = 'flex';
                    }
                });
            });
            
            // Excluir produto
            document.querySelectorAll('#products-table .action-btn.delete').forEach(button => {
                button.addEventListener('click', function() {
                    const productId = parseInt(this.getAttribute('data-id'));
                    
                    if (confirm('Tem certeza que deseja excluir este produto?')) {
                        db.products = db.products.filter(p => p.id !== productId);
                        saveData();
                        updateProductsSection();
                    }
                });
            });
            
            // Salvar produto
            document.getElementById('save-product').addEventListener('click', function() {
                const modal = document.getElementById('product-modal');
                const mode = modal.getAttribute('data-mode');
                const name = document.getElementById('product-name').value;
                const quantity = parseInt(document.getElementById('product-quantity').value) || 0;
                const idealQuantity = parseInt(document.getElementById('product-ideal-quantity').value) || 0;
                const cost = parseFloat(document.getElementById('product-cost').value.replace('R$', '').replace('.', '').replace(',', '.').trim()) || 0;
                const price = parseFloat(document.getElementById('product-price').value.replace('R$', '').replace('.', '').replace(',', '.').trim()) || 0;
                
                if (!name) {
                    alert('Por favor, informe o nome do produto');
                    return;
                }
                
                if (mode === 'add') {
                    const newProduct = {
                        id: generateId(),
                        name,
                        quantity,
                        idealQuantity,
                        cost,
                        price
                    };
                    
                    db.products.push(newProduct);
                    alert('Produto cadastrado com sucesso!');
                } else {
                    const productId = parseInt(modal.getAttribute('data-product-id'));
                    const product = db.products.find(p => p.id === productId);
                    
                    if (product) {
                        product.name = name;
                        product.quantity = quantity;
                        product.idealQuantity = idealQuantity;
                        product.cost = cost;
                        product.price = price;
                        alert('Produto atualizado com sucesso!');
                    }
                }
                
                saveData();
                updateProductsSection();
                modal.style.display = 'none';
            });
            
            // Formatar moeda nos inputs
            document.getElementById('product-cost').addEventListener('blur', function() {
                const value = parseFloat(this.value.replace('R$', '').replace('.', '').replace(',', '.').trim()) || 0;
                this.value = formatCurrency(value);
            });
            
            document.getElementById('product-price').addEventListener('blur', function() {
                const value = parseFloat(this.value.replace('R$', '').replace('.', '').replace(',', '.').trim()) || 0;
                this.value = formatCurrency(value);
            });
        }

        // Seção de Ordens de Serviço
        function updateServiceOrdersSection() {
            // Atualizar tabela de ordens de serviço
            const serviceOrdersTable = document.getElementById('service-orders-table').querySelector('tbody');
            serviceOrdersTable.innerHTML = '';
            
            db.serviceOrders.forEach(order => {
                const row = document.createElement('tr');
                row.setAttribute('data-id', order.id);
                row.innerHTML = `
                    <td>${order.id}</td>
                    <td>${order.customer.name}</td>
                    <td>${order.problem.substring(0, 30)}${order.problem.length > 30 ? '...' : ''}</td>
                    <td>${formatDate(order.date)}</td>
                    <td>${formatCurrency(order.estimatedValue)}</td>
                    <td><span class="status ${order.status === 'completed' ? 'completed' : order.status === 'canceled' ? 'canceled' : 'pending'}">
                        ${order.status === 'completed' ? 'Concluído' : order.status === 'canceled' ? 'Cancelado' : 'Pendente'}
                    </span></td>
                    <td>
                        <button class="action-btn edit" data-id="${order.id}"><i class="fas fa-edit"></i></button>
                        <button class="action-btn delete" data-id="${order.id}"><i class="fas fa-trash"></i></button>
                    </td>
                `;
                serviceOrdersTable.appendChild(row);
            });
            
            // Busca de ordens de serviço
            document.getElementById('service-order-search').addEventListener('input', function() {
                const searchTerm = this.value.toLowerCase();
                document.querySelectorAll('#service-orders-table tbody tr').forEach(row => {
                    const customerName = row.querySelector('td:nth-child(2)').textContent.toLowerCase();
                    const problem = row.querySelector('td:nth-child(3)').textContent.toLowerCase();
                    if (customerName.includes(searchTerm) || problem.includes(searchTerm)) {
                        row.style.display = '';
                    } else {
                        row.style.display = 'none';
                    }
                });
            });
            
            // Nova ordem de serviço
            document.getElementById('add-service-order-btn').addEventListener('click', function() {
                document.getElementById('service-order-modal-title').textContent = 'Nova Ordem de Serviço';
                document.getElementById('service-order-customer-search').value = '';
                document.getElementById('service-order-date').value = new Date().toISOString().split('T')[0];
                document.getElementById('service-order-problem').value = '';
                document.getElementById('service-order-items').value = '';
                document.getElementById('service-order-estimated-value').value = '';
                document.getElementById('service-order-deadline').value = '';
                document.getElementById('service-order-status').value = 'pending';
                document.getElementById('service-order-modal').setAttribute('data-mode', 'add');
                document.getElementById('print-service-order').style.display = 'none';
                document.getElementById('service-order-modal').style.display = 'flex';
            });
            
            // Busca de cliente na ordem de serviço
            document.getElementById('service-order-customer-search').addEventListener('input', function() {
                const searchTerm = this.value.toLowerCase();
                const resultsContainer = document.getElementById('service-order-customer-search-results');
                
                if (searchTerm.length < 2) {
                    resultsContainer.style.display = 'none';
                    return;
                }
                
                const filteredCustomers = db.customers.filter(customer => 
                    customer.name.toLowerCase().includes(searchTerm) || 
                    (customer.phone && customer.phone.includes(searchTerm)) ||
                    (customer.cpf && customer.cpf.includes(searchTerm))
                );
                
                if (filteredCustomers.length > 0) {
                    resultsContainer.innerHTML = '';
                    filteredCustomers.forEach(customer => {
                        const div = document.createElement('div');
                        div.className = 'product-item';
                        div.style.padding = '10px';
                        div.style.cursor = 'pointer';
                        div.innerHTML = `
                            <div class="product-info">
                                <h4>${customer.name}</h4>
                                <p>${customer.phone || ''} ${customer.cpf || ''}</p>
                            </div>
                        `;
                        div.addEventListener('click', function() {
                            document.getElementById('service-order-customer-search').value = customer.name;
                            document.getElementById('service-order-modal').setAttribute('data-customer-id', customer.id);
                            resultsContainer.style.display = 'none';
                        });
                        resultsContainer.appendChild(div);
                    });
                    resultsContainer.style.display = 'block';
                } else {
                    resultsContainer.innerHTML = '<div style="padding: 10px;">Nenhum cliente encontrado</div>';
                    resultsContainer.style.display = 'block';
                }
            });
            
            // Novo cliente na ordem de serviço
            document.getElementById('service-order-new-customer-btn').addEventListener('click', function() {
                document.getElementById('new-customer-modal').style.display = 'flex';
            });
            
            // Editar ordem de serviço
            document.querySelectorAll('#service-orders-table .action-btn.edit').forEach(button => {
                button.addEventListener('click', function() {
                    const orderId = parseInt(this.getAttribute('data-id'));
                    const order = db.serviceOrders.find(o => o.id === orderId);
                    
                    if (order) {
                        document.getElementById('service-order-modal-title').textContent = 'Editar Ordem de Serviço';
                        document.getElementById('service-order-customer-search').value = order.customer.name;
                        document.getElementById('service-order-modal').setAttribute('data-customer-id', order.customer.id);
                        document.getElementById('service-order-date').value = order.date.split('T')[0];
                        document.getElementById('service-order-problem').value = order.problem;
                        document.getElementById('service-order-items').value = order.items;
                        document.getElementById('service-order-estimated-value').value = formatCurrency(order.estimatedValue);
                        document.getElementById('service-order-deadline').value = order.deadline;
                        document.getElementById('service-order-status').value = order.status;
                        document.getElementById('service-order-modal').setAttribute('data-order-id', order.id);
                        document.getElementById('service-order-modal').setAttribute('data-mode', 'edit');
                        document.getElementById('print-service-order').style.display = 'inline-block';
                        document.getElementById('service-order-modal').style.display = 'flex';
                    }
                });
            });
            
            // Excluir ordem de serviço
            document.querySelectorAll('#service-orders-table .action-btn.delete').forEach(button => {
                button.addEventListener('click', function() {
                    const orderId = parseInt(this.getAttribute('data-id'));
                    
                    if (confirm('Tem certeza que deseja excluir esta ordem de serviço?')) {
                        db.serviceOrders = db.serviceOrders.filter(o => o.id !== orderId);
                        saveData();
                        updateServiceOrdersSection();
                    }
                });
            });
            
            // Salvar ordem de serviço
            document.getElementById('save-service-order').addEventListener('click', function() {
                const modal = document.getElementById('service-order-modal');
                const mode = modal.getAttribute('data-mode');
                const customerId = parseInt(modal.getAttribute('data-customer-id'));
                const customer = db.customers.find(c => c.id === customerId);
                const date = document.getElementById('service-order-date').value;
                const problem = document.getElementById('service-order-problem').value;
                const items = document.getElementById('service-order-items').value;
                const estimatedValue = parseFloat(document.getElementById('service-order-estimated-value').value.replace('R$', '').replace('.', '').replace(',', '.').trim()) || 0;
                const deadline = document.getElementById('service-order-deadline').value;
                const status = document.getElementById('service-order-status').value;
                
                if (!customer) {
                    alert('Por favor, selecione um cliente');
                    return;
                }
                
                if (!problem) {
                    alert('Por favor, descreva o problema');
                    return;
                }
                
                if (mode === 'add') {
                    const newOrder = {
                        id: generateId(),
                        customer,
                        date: new Date(date).toISOString(),
                        problem,
                        items,
                        estimatedValue,
                        deadline,
                        status
                    };
                    
                    db.serviceOrders.unshift(newOrder);
                    
                    // Adicionar ao histórico do cliente
                    customer.serviceOrders = customer.serviceOrders || [];
                    customer.serviceOrders.unshift({
                        id: newOrder.id,
                        date: newOrder.date,
                        problem: newOrder.problem,
                        estimatedValue: newOrder.estimatedValue,
                        status: newOrder.status
                    });

                    alert('Ordem de serviço cadastrada com sucesso!');
                } else {
                    const orderId = parseInt(modal.getAttribute('data-order-id'));
                    const order = db.serviceOrders.find(o => o.id === orderId);
                    
                    if (order) {
                        // Remover do histórico do cliente antigo
                        const oldCustomer = order.customer;
                        if (oldCustomer.id !== customerId) {
                            oldCustomer.serviceOrders = oldCustomer.serviceOrders.filter(so => so.id !== order.id);
                            
                            // Adicionar ao novo cliente
                            customer.serviceOrders = customer.serviceOrders || [];
                            customer.serviceOrders.unshift({
                                id: order.id,
                                date: date,
                                problem: problem,
                                estimatedValue: estimatedValue,
                                status: status
                            });
                        } else {
                            // Atualizar no histórico do cliente
                            const customerOrder = customer.serviceOrders.find(so => so.id === order.id);
                            if (customerOrder) {
                                customerOrder.date = date;
                                customerOrder.problem = problem;
                                customerOrder.estimatedValue = estimatedValue;
                                customerOrder.status = status;
                            }
                        }
                        
                        order.customer = customer;
                        order.date = new Date(date).toISOString();
                        order.problem = problem;
                        order.items = items;
                        order.estimatedValue = estimatedValue;
                        order.deadline = deadline;
                        order.status = status;

                        alert('Ordem de serviço atualizada com sucesso!');
                    }
                }
                
                saveData();
                updateServiceOrdersSection();
                modal.style.display = 'none';
            });
            
            // Imprimir ordem de serviço
            document.getElementById('print-service-order').addEventListener('click', function() {
                const orderId = parseInt(document.getElementById('service-order-modal').getAttribute('data-order-id'));
                const order = db.serviceOrders.find(o => o.id === orderId);
                
                if (order) {
                    document.getElementById('print-os-id').textContent = order.id;
                    document.getElementById('print-customer-name').textContent = order.customer.name;
                    document.getElementById('print-customer-phone').textContent = order.customer.phone ? formatPhone(order.customer.phone) : '';
                    document.getElementById('print-customer-cpf').textContent = order.customer.cpf ? formatCPF(order.customer.cpf) : '';
                    document.getElementById('print-os-date').textContent = formatDate(order.date);
                    document.getElementById('print-os-deadline').textContent = order.deadline ? formatDate(order.deadline) : '';
                    document.getElementById('print-os-status').textContent = 
                        order.status === 'completed' ? 'Concluído' : 
                        order.status === 'canceled' ? 'Cancelado' : 'Pendente';
                    document.getElementById('print-os-value').textContent = formatCurrency(order.estimatedValue);
                    document.getElementById('print-os-problem').textContent = order.problem;
                    document.getElementById('print-os-items').textContent = order.items;
                    document.getElementById('print-customer-name-footer').textContent = order.customer.name;
                    
                    document.getElementById('service-order-print-modal').style.display = 'flex';
                }
            });
            
            // Botão de impressão na modal de visualização
            document.getElementById('print-service-order-btn').addEventListener('click', function() {
                const printContent = document.getElementById('service-order-print-content').innerHTML;
                const originalContent = document.body.innerHTML;
                
                document.body.innerHTML = printContent;
                window.print();
                document.body.innerHTML = originalContent;
                
                // Recarregar eventos
                updateServiceOrdersSection();
            });
            
            // Formatar moeda no input de valor estimado
            document.getElementById('service-order-estimated-value').addEventListener('blur', function() {
                const value = parseFloat(this.value.replace('R$', '').replace('.', '').replace(',', '.').trim()) || 0;
                this.value = formatCurrency(value);
            });
        }

        // Inicializar a seção Dashboard
        updateDashboard();

        // Aplicar máscaras aos campos de telefone existentes
        document.querySelectorAll('.phone-mask').forEach(input => {
            applyPhoneMask(input);
        });

        // Aplicar máscaras aos campos de CPF existentes
        document.querySelectorAll('input[placeholder="000.000.000-00"]').forEach(input => {
            applyCPFMask(input);
        });