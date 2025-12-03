-- Atualizar senha do admin para admin123

USE sistema_residencial;

UPDATE usuarios 
SET senha = '$2a$10$jCGMPZShJUOKxHRlecw32OFMIvwVdIHIEpzSh0gzTACXqQnOwt22G' 
WHERE email = 'admin@sistema.com';

-- Verificar a atualização
SELECT 
  id,
  email,
  tipo,
  ativo,
  LENGTH(senha) as tamanho_hash,
  CASE 
    WHEN LENGTH(senha) = 60 THEN '✓ Hash atualizado com sucesso'
    ELSE '✗ Erro na atualização'
  END as status
FROM usuarios 
WHERE email = 'admin@sistema.com';
