-- Inserir Clientes
insert into public.clients (name, email, phone, income, assets, profile, status, consultant_id)
values 
('Ricardo Ferreira', 'ricardo@cliente.com', '11999998888', 15000.00, 500000.00, 'moderado', 'ativo', (select id from profiles limit 1)),
('Fernanda Oliveira', 'fernanda@cliente.com', '11988887777', 22000.00, 1200000.00, 'arrojado', 'ativo', (select id from profiles limit 1)),
('João da Silva', 'joao@prospecto.com', '11977776666', 5000.00, 50000.00, 'conservador', 'prospecto', (select id from profiles limit 1));

-- Inserir Leads
insert into public.leads (date, name, email, phone, funil, utm_source, utm_campaign, status)
values
(now(), 'Carlos Lead', 'carlos@lead.com', '11955554444', 'Novo', 'Facebook', 'BlackFriday', 'Novo'),
(now() - interval '2 days', 'Ana Lead', 'ana@lead.com', '11944443333', 'Contato', 'Google', 'Institucional', 'Em Andamento'),
(now() - interval '5 days', 'Pedro Lead', 'pedro@lead.com', '11933332222', 'Proposta', 'Instagram', 'Stories', 'Quente');

-- Inserir Seguros (Vinculando ao primeiro cliente e primeiro consultor encontrado)
insert into public.insurances (client_id, consultant_id, product_name, premium_value, start_date, status, policy_number)
values
((select id from clients where email = 'ricardo@cliente.com' limit 1), (select id from profiles limit 1), 'Seguro de Vida M1', 250.00, '2024-01-15', 'ativo', 'POL-001'),
((select id from clients where email = 'fernanda@cliente.com' limit 1), (select id from profiles limit 1), 'Seguro Profissional', 450.00, '2024-02-20', 'ativo', 'POL-002'),
((select id from clients where email = 'fernanda@cliente.com' limit 1), (select id from profiles limit 1), 'Previdência Privada', 1000.00, '2024-03-10', 'analise', 'PROP-003');

-- Inserir Comissões (Vinculadas aos seguros acima)
insert into public.commissions (consultant_id, insurance_id, description, type, level, amount, competence, status)
values
-- Comissão do Seguro do Ricardo
((select id from profiles limit 1), (select id from insurances where policy_number = 'POL-001' limit 1), 'Venda Seguro - Ricardo', 'Adesao', 'Direto', 62.50, '2024-11-01', 'aprovado'),
-- Comissão da Recorrência da Fernanda
((select id from profiles limit 1), (select id from insurances where policy_number = 'POL-002' limit 1), 'Recorrência - Fernanda', 'Recorrencia', 'Direto', 45.00, '2024-11-01', 'pendente');

-- Inserir Tráfego Pago
insert into public.traffic_ads (date_start, campaign_name, ad_name, valor_investido, impressoes, cliques_no_link, ctr_link, link_cpc)
values
('2024-11-01', 'Campanha Black Friday', 'Img_01_Promo', 150.00, 5000, 120, 2.40, 1.25),
('2024-11-02', 'Campanha Institucional', 'Video_Depoimento', 200.00, 8000, 95, 1.18, 2.10),
('2024-11-03', 'Campanha Leads', 'Carrossel_Beneficios', 300.00, 12000, 250, 2.08, 1.20);
