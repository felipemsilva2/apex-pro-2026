export interface LibraryFood {
    name: string;
    protein: number; // per 100g
    carbs: number;   // per 100g
    fats: number;    // per 100g
    kcal: number;    // per 100g
    category: 'Proteínas' | 'Carboidratos' | 'Gorduras' | 'Frutas/Vegetais' | 'Suplementos';
}

export const FITNESS_LIBRARY: LibraryFood[] = [
    // Proteínas
    { name: 'Peito de Frango Grelhado', protein: 31, carbs: 0, fats: 3.6, kcal: 159, category: 'Proteínas' },
    { name: 'Carne Patinho Grelhado', protein: 35, carbs: 0, fats: 7, kcal: 219, category: 'Proteínas' },
    { name: 'Alcatra Grelhada', protein: 31, carbs: 0, fats: 11, kcal: 241, category: 'Proteínas' },
    { name: 'Tilápia Grelhada', protein: 26, carbs: 0, fats: 2.7, kcal: 128, category: 'Proteínas' },
    { name: 'Ovo Inteiro Cozido', protein: 13, carbs: 1, fats: 10, kcal: 155, category: 'Proteínas' },
    { name: 'Clara de Ovo', protein: 11, carbs: 0.7, fats: 0.2, kcal: 52, category: 'Proteínas' },
    { name: 'Atum em Lata (em água)', protein: 25, carbs: 0, fats: 1, kcal: 116, category: 'Proteínas' },
    { name: 'Lombo de Porco Grelhado', protein: 31, carbs: 0, fats: 8, kcal: 204, category: 'Proteínas' },
    { name: 'Salmão Grelhado', protein: 25, carbs: 0, fats: 12, kcal: 208, category: 'Proteínas' },

    // Carboidratos
    { name: 'Arroz Branco Cozido', protein: 2.5, carbs: 28, fats: 0.2, kcal: 130, category: 'Carboidratos' },
    { name: 'Arroz Integral Cozido', protein: 2.6, carbs: 25, fats: 1, kcal: 124, category: 'Carboidratos' },
    { name: 'Batata Doce Cozida', protein: 2, carbs: 20, fats: 0.1, kcal: 86, category: 'Carboidratos' },
    { name: 'Mandioca Cozida', protein: 0.6, carbs: 30, fats: 0.3, kcal: 125, category: 'Carboidratos' },
    { name: 'Macarrão Integral Cozido', protein: 5.3, carbs: 26, fats: 1.5, kcal: 147, category: 'Carboidratos' },
    { name: 'Aveia em Flocos', protein: 14, carbs: 67, fats: 7, kcal: 394, category: 'Carboidratos' },
    { name: 'Feijão Carioca Cozido', protein: 5, carbs: 14, fats: 0.5, kcal: 76, category: 'Carboidratos' },
    { name: 'Pão Integral', protein: 12, carbs: 43, fats: 3.5, kcal: 250, category: 'Carboidratos' },
    { name: 'Cuscuz Marroquino', protein: 3.8, carbs: 23, fats: 0.2, kcal: 112, category: 'Carboidratos' },
    { name: 'Batata Inglesa Cozida', protein: 1.8, carbs: 15, fats: 0.1, kcal: 70, category: 'Carboidratos' },
    { name: 'Tapioca (goma)', protein: 0, carbs: 54, fats: 0, kcal: 216, category: 'Carboidratos' },

    // Gorduras
    { name: 'Azeite de Oliva', protein: 0, carbs: 0, fats: 100, kcal: 884, category: 'Gorduras' },
    { name: 'Abacate', protein: 2, carbs: 9, fats: 15, kcal: 160, category: 'Gorduras' },
    { name: 'Pasta de Amendoim Integral', protein: 29, carbs: 12, fats: 50, kcal: 588, category: 'Gorduras' },
    { name: 'Castanha do Pará', protein: 14, carbs: 12, fats: 66, kcal: 656, category: 'Gorduras' },
    { name: 'Amêndoas', protein: 21, carbs: 22, fats: 50, kcal: 579, category: 'Gorduras' },

    // Frutas/Vegetais
    { name: 'Banana Prata', protein: 1.3, carbs: 26, fats: 0.1, kcal: 98, category: 'Frutas/Vegetais' },
    { name: 'Maçã com Casca', protein: 0.3, carbs: 14, fats: 0.2, kcal: 52, category: 'Frutas/Vegetais' },
    { name: 'Mamão Papaia', protein: 0.5, carbs: 11, fats: 0.1, kcal: 43, category: 'Frutas/Vegetais' },
    { name: 'Uva', protein: 0.6, carbs: 17, fats: 0.2, kcal: 67, category: 'Frutas/Vegetais' },
    { name: 'Brócolis Cozido', protein: 2.1, carbs: 4.4, fats: 0.5, kcal: 25, category: 'Frutas/Vegetais' },
    { name: 'Espinafre Cozido', protein: 2.7, carbs: 3.4, fats: 0.3, kcal: 23, category: 'Frutas/Vegetais' },
    { name: 'Morango', protein: 0.7, carbs: 7.7, fats: 0.3, kcal: 33, category: 'Frutas/Vegetais' },

    // Suplementos
    { name: 'Whey Protein Concentrado', protein: 80, carbs: 5, fats: 6, kcal: 400, category: 'Suplementos' },
    { name: 'Creatina Monohidratada', protein: 0, carbs: 0, fats: 0, kcal: 0, category: 'Suplementos' },
    { name: 'BCAA em Pó', protein: 0, carbs: 0, fats: 0, kcal: 0, category: 'Suplementos' },
];

export function formatDisplayName(name: string): string {
    if (!name) return "";

    // 1. Remove commas and everything after if it looks like technical specs
    // e.g. "ARROZ, TIPO 2, COZIDO" -> "ARROZ TIPO 2 COZIDO"
    let clean = name.replace(/,/g, '');

    // 2. Remove common technical suffixes
    const techSuffixes = [
        'TABLETE', 'GENERICO', 'TIPO [0-9]', 'CRU', 'COZIDO',
        'SEM SAL', 'COM SAL', 'INDUSTRIALIZADO'
    ];

    // Note: We might want to keep "Cozido" or "Cru" as they affect macros, 
    // but let's make it cleaner.

    // 3. Title Case conversion
    return clean.toLowerCase().split(' ').map(word =>
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
}
