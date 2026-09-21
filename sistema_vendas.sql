-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Tempo de geração: 21/09/2026 às 03:42
-- Versão do servidor: 10.4.32-MariaDB
-- Versão do PHP: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Banco de dados: `sistema_vendas`
--

DELIMITER $$
--
-- Procedimentos
--
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_buscar_vendas` (IN `p_categoria_id` INT, IN `p_data_inicio` DATE, IN `p_data_fim` DATE, IN `p_limite` INT, IN `p_offset` INT)   BEGIN

    SELECT
        v.venda_id,
        v.produto_id,
        v.produto,
        v.categoria_id,
        v.categoria,
        v.quantidade,
        v.custo_reposicao,
        v.custo_unitario,
        v.valor_unitario,
        v.total AS total_venda,
        v.data_venda,

        resumo.total AS total_registros,
        resumo.faturamento,
        resumo.produtos_vendidos

    FROM vw_vendas_detalhadas v

    CROSS JOIN (

        SELECT
            COUNT(*) AS total,

            COALESCE(
                SUM(total),
                0
            ) AS faturamento,

            COALESCE(
                SUM(quantidade),
                0
            ) AS produtos_vendidos

        FROM vw_vendas_detalhadas

        WHERE
            (
                p_categoria_id IS NULL
                OR categoria_id = p_categoria_id
            )

            AND

            (
                p_data_inicio IS NULL
                OR DATE(data_venda) >= p_data_inicio
            )

            AND

            (
                p_data_fim IS NULL
                OR DATE(data_venda) <= p_data_fim
            )

    ) AS resumo

    WHERE
        (
            p_categoria_id IS NULL
            OR v.categoria_id = p_categoria_id
        )

        AND

        (
            p_data_inicio IS NULL
            OR DATE(v.data_venda) >= p_data_inicio
        )

        AND

        (
            p_data_fim IS NULL
            OR DATE(v.data_venda) <= p_data_fim
        )

    ORDER BY
        v.data_venda DESC,
        v.venda_id DESC

    LIMIT p_limite
    OFFSET p_offset;

END$$

--
-- Funções
--
CREATE DEFINER=`root`@`localhost` FUNCTION `fn_total_venda` (`p_quantidade` INT, `p_valor_unitario` DECIMAL(10,2)) RETURNS DECIMAL(10,2) DETERMINISTIC BEGIN
    RETURN p_quantidade * p_valor_unitario;
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Estrutura para tabela `categoria`
--

CREATE TABLE `categoria` (
  `id` int(11) NOT NULL,
  `nome` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `categoria`
--

INSERT INTO `categoria` (`id`, `nome`) VALUES
(1, 'Eletrônicos'),
(2, 'Informática'),
(3, 'Games e Consoles'),
(4, 'Periféricos');

-- --------------------------------------------------------

--
-- Estrutura para tabela `compra`
--

CREATE TABLE `compra` (
  `id` int(11) NOT NULL,
  `fornecedor` varchar(150) DEFAULT NULL,
  `data_compra` datetime NOT NULL DEFAULT current_timestamp(),
  `total` decimal(10,2) NOT NULL DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `compra`
--

INSERT INTO `compra` (`id`, `fornecedor`, `data_compra`, `total`) VALUES
(2, 'Distribuidora X', '2026-09-19 22:31:00', 3840.00);

-- --------------------------------------------------------

--
-- Estrutura para tabela `compra_item`
--

CREATE TABLE `compra_item` (
  `id` int(11) NOT NULL,
  `compra_id` int(11) NOT NULL,
  `produto_id` int(11) NOT NULL,
  `quantidade` int(11) NOT NULL,
  `custo_unitario` decimal(10,2) NOT NULL,
  `total` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `compra_item`
--

INSERT INTO `compra_item` (`id`, `compra_id`, `produto_id`, `quantidade`, `custo_unitario`, `total`) VALUES
(2, 2, 3, 6, 640.00, 3840.00);

-- --------------------------------------------------------

--
-- Estrutura para tabela `despesa`
--

CREATE TABLE `despesa` (
  `id` int(11) NOT NULL,
  `categoria` varchar(100) NOT NULL,
  `descricao` varchar(255) DEFAULT NULL,
  `valor` decimal(10,2) NOT NULL,
  `data_despesa` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `despesa`
--

INSERT INTO `despesa` (`id`, `categoria`, `descricao`, `valor`, `data_despesa`) VALUES
(3, 'Energia', 'Pagamento Da Energia', 530.00, '2026-09-19 22:47:00');

-- --------------------------------------------------------

--
-- Estrutura para tabela `produto`
--

CREATE TABLE `produto` (
  `id` int(11) NOT NULL,
  `nome` varchar(150) NOT NULL,
  `preco` decimal(10,2) NOT NULL,
  `custo_reposicao` decimal(10,2) NOT NULL DEFAULT 0.00,
  `estoque` int(11) NOT NULL,
  `categoria_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `produto`
--

INSERT INTO `produto` (`id`, `nome`, `preco`, `custo_reposicao`, `estoque`, `categoria_id`) VALUES
(1, 'Mouse Gamer', 120.00, 0.00, 15, 1),
(2, 'Teclado Mecânico', 250.00, 0.00, 7, 2),
(3, 'Monitor 24 Polegadas', 899.90, 640.00, 10, 1),
(4, 'Headset Gamer', 180.00, 0.00, 20, 3),
(5, 'Webcam Full HD', 220.00, 0.00, 8, 3);

--
-- Acionadores `produto`
--
DELIMITER $$
CREATE TRIGGER `trg_produto_valores_positivos` BEFORE UPDATE ON `produto` FOR EACH ROW BEGIN

    IF NEW.preco < 0 THEN
        SET NEW.preco = ABS(NEW.preco);
    END IF;

    IF NEW.estoque < 0 THEN
        SET NEW.estoque = ABS(NEW.estoque);
    END IF;

END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estrutura para tabela `usuario`
--

CREATE TABLE `usuario` (
  `id` int(11) NOT NULL,
  `nome` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `senha` varchar(255) NOT NULL,
  `perfil` enum('admin','vendedor') NOT NULL DEFAULT 'vendedor',
  `ativo` tinyint(1) NOT NULL DEFAULT 1,
  `criado_em` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `usuario`
--

INSERT INTO `usuario` (`id`, `nome`, `email`, `senha`, `perfil`, `ativo`, `criado_em`) VALUES
(1, 'Administrador', 'admin@sistemavendas.com', '$2y$10$YuoP3FP82b14XwJXfDWLN.qyg.uftp8IEtOCj6hQ7FsqfCrfBy932', 'admin', 1, '2026-09-19 19:13:22'),
(2, 'Julio', 'vendas@vendaspro.com', '$2y$10$mgHwUZZUyKQ8W59d1PqeYuTpwugwGF2OIG6Ts.ctQTf0nQ/MtIO5e', 'vendedor', 1, '2026-09-19 22:45:13');

-- --------------------------------------------------------

--
-- Estrutura para tabela `venda`
--

CREATE TABLE `venda` (
  `id` int(11) NOT NULL,
  `produto_id` int(11) NOT NULL,
  `quantidade` int(11) NOT NULL,
  `valor_unitario` decimal(10,2) NOT NULL,
  `custo_unitario` decimal(10,2) NOT NULL DEFAULT 0.00,
  `data_venda` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `venda`
--

INSERT INTO `venda` (`id`, `produto_id`, `quantidade`, `valor_unitario`, `custo_unitario`, `data_venda`) VALUES
(1, 1, 2, 120.00, 0.00, '2026-09-15 10:00:00'),
(2, 2, 1, 250.00, 0.00, '2026-09-15 11:00:00'),
(3, 1, 3, 120.00, 0.00, '2026-09-16 14:00:00'),
(4, 3, 1, 899.90, 640.00, '2026-09-16 15:00:00'),
(5, 4, 2, 180.00, 0.00, '2026-09-17 09:00:00'),
(6, 1, 4, 120.00, 0.00, '2026-09-17 16:00:00'),
(9, 4, 3, 180.00, 0.00, '2026-09-15 19:21:00');

-- --------------------------------------------------------

--
-- Estrutura stand-in para view `vw_vendas_detalhadas`
-- (Veja abaixo para a visão atual)
--
CREATE TABLE `vw_vendas_detalhadas` (
`venda_id` int(11)
,`produto_id` int(11)
,`produto` varchar(150)
,`categoria_id` int(11)
,`categoria` varchar(100)
,`quantidade` int(11)
,`custo_reposicao` decimal(10,2)
,`custo_unitario` decimal(10,2)
,`valor_unitario` decimal(10,2)
,`total` decimal(10,2)
,`data_venda` datetime
);

-- --------------------------------------------------------

--
-- Estrutura para view `vw_vendas_detalhadas`
--
DROP TABLE IF EXISTS `vw_vendas_detalhadas`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vw_vendas_detalhadas`  AS SELECT `v`.`id` AS `venda_id`, `p`.`id` AS `produto_id`, `p`.`nome` AS `produto`, `c`.`id` AS `categoria_id`, `c`.`nome` AS `categoria`, `v`.`quantidade` AS `quantidade`, `v`.`custo_unitario` AS `custo_reposicao`, `v`.`custo_unitario` AS `custo_unitario`, `v`.`valor_unitario` AS `valor_unitario`, `fn_total_venda`(`v`.`quantidade`,`v`.`valor_unitario`) AS `total`, `v`.`data_venda` AS `data_venda` FROM ((`venda` `v` join `produto` `p` on(`p`.`id` = `v`.`produto_id`)) join `categoria` `c` on(`c`.`id` = `p`.`categoria_id`)) ;

--
-- Índices para tabelas despejadas
--

--
-- Índices de tabela `categoria`
--
ALTER TABLE `categoria`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `compra`
--
ALTER TABLE `compra`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `compra_item`
--
ALTER TABLE `compra_item`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_compra_item_compra` (`compra_id`),
  ADD KEY `fk_compra_item_produto` (`produto_id`);

--
-- Índices de tabela `despesa`
--
ALTER TABLE `despesa`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `produto`
--
ALTER TABLE `produto`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_produto_categoria` (`categoria_id`);

--
-- Índices de tabela `usuario`
--
ALTER TABLE `usuario`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Índices de tabela `venda`
--
ALTER TABLE `venda`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_venda_produto` (`produto_id`);

--
-- AUTO_INCREMENT para tabelas despejadas
--

--
-- AUTO_INCREMENT de tabela `categoria`
--
ALTER TABLE `categoria`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de tabela `compra`
--
ALTER TABLE `compra`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de tabela `compra_item`
--
ALTER TABLE `compra_item`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de tabela `despesa`
--
ALTER TABLE `despesa`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de tabela `produto`
--
ALTER TABLE `produto`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de tabela `usuario`
--
ALTER TABLE `usuario`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de tabela `venda`
--
ALTER TABLE `venda`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- Restrições para tabelas despejadas
--

--
-- Restrições para tabelas `compra_item`
--
ALTER TABLE `compra_item`
  ADD CONSTRAINT `fk_compra_item_compra` FOREIGN KEY (`compra_id`) REFERENCES `compra` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_compra_item_produto` FOREIGN KEY (`produto_id`) REFERENCES `produto` (`id`) ON UPDATE CASCADE;

--
-- Restrições para tabelas `produto`
--
ALTER TABLE `produto`
  ADD CONSTRAINT `fk_produto_categoria` FOREIGN KEY (`categoria_id`) REFERENCES `categoria` (`id`);

--
-- Restrições para tabelas `venda`
--
ALTER TABLE `venda`
  ADD CONSTRAINT `fk_venda_produto` FOREIGN KEY (`produto_id`) REFERENCES `produto` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
