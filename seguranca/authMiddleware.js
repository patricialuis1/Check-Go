// seguranca/authMiddleware.js
import supabase from "../config/supabaseClient.js"; 

/**
 * Middleware para proteger rotas usando o Token de Sessão na tabela users.
 */
export async function protegerRota(req, res, next) {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ resultado: false, message: "Acesso negado: Token de sessão em falta." });
    }

    const token = authHeader.split(' ')[1]; 

    try {
        // PROCURAR NA DB: Tenta encontrar o utilizador com este token de sessão
        const { data: userProfile, error } = await supabase
            .from("users")
            .select("id, role, loja_id, ativo, auth_id, session_token") // Incluímos session_token na seleção
            .eq("session_token", token)
            .single();
        
        if (error || !userProfile || !userProfile.ativo) {
            return res.status(401).json({ resultado: false, message: "Acesso negado: Sessão inválida ou expirada." });
        }

        req.user = userProfile; 
        
        next(); // Permite que a rota continue
    } catch (err) {
        console.error("🔥 ERRO em protegerRota:", err.message);
        return res.status(500).json({ resultado: false, message: "Erro interno no servidor de autenticação." });
    }
}

/**
 * Middleware para verificar se o utilizador tem uma das roles permitidas.
 * Deve ser usado APÓS protegerRota.
 */
export function autorizarCargos(rolesPermitidas) {
    return (req, res, next) => {
        const user = req.user;
        
        if (!user || !rolesPermitidas.includes(user.role)) {
            return res.status(403).json({ 
                resultado: false,
                message: `Proibido: O seu cargo (${user?.role}) não tem permissão para esta ação.`
            });
        }
        next();
    };
}