-- Execute este script no MySQL Workbench ou phpMyAdmin

USE sistema_residencial;

-- Tabela de Usuários para autenticação e controle de acesso
CREATE TABLE IF NOT EXISTS usuarios (
  id INT PRIMARY KEY AUTO_INCREMENT,
  profissional_id INT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  senha VARCHAR(255) NOT NULL,
  tipo ENUM('admin', 'profissional') NOT NULL DEFAULT 'profissional',
  ativo BOOLEAN DEFAULT TRUE,
  ultimo_acesso DATETIME NULL,
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (profissional_id) REFERENCES profissionais(id) ON DELETE CASCADE,
  
  INDEX idx_email (email),
  INDEX idx_tipo (tipo),
  INDEX idx_ativo (ativo),
  INDEX idx_profissional_id (profissional_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Criar usuário admin padrão (senha: admin123 - MUDE EM PRODUÇÃO!)
-- Hash bcrypt para 'admin123'
INSERT INTO usuarios (email, senha, tipo, ativo) 
VALUES ('admin@sistema.com', '$2a$10$9LQv8rKFZxP.xmqJHw7YZuKGvZfUvF8xQZ3h5qBWYVv.mKqWxGBJm', 'admin', TRUE)
ON DUPLICATE KEY UPDATE email = email;

SELECT 'Tabela usuarios criada com sucesso!' as status;
SELECT * FROM usuarios;
