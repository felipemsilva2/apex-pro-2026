/**
 * Utility to map exercise names to local stable GIFs.
 * Prevents broken external links from MuscleWiki/Jefit/Giphy.
 */
export const getLocalGifPath = (name: string, currentUrl?: string | null) => {
    if (!name) return currentUrl || "";

    const n = name.toLowerCase();

    // Core Exercise Mappings
    if (n.includes("supino reto")) return "/exercises/Supino/supino-reto.gif";
    if (n.includes("supino inclinado")) return "/exercises/Supino/supino-inclinado-com-barra.gif";
    if (n.includes("supino declinado")) return "/exercises/Supino/supino-declinado.gif";
    if (n.includes("lateral")) return "/exercises/Ombros/elevação-lateral.gif";
    if (n.includes("frontal")) return "/exercises/Ombros/elevação-frontal.gif";
    if (n.includes("pulley")) return "/exercises/antebraços/rosca-direta-na-polia.gif";
    if (n.includes("testa") || n.includes("francês") || n.includes("frances")) return "/exercises/Ombros/extensão-de-triceps-deitado-barra.gif";
    if (n.includes("agachamento")) return "/exercises/quadris/agachamento-completo-barra.gif";
    if (n.includes("terra")) return "/exercises/quadris/levantamento-terra-com-barra.gif";
    if (n.includes("leg press")) return "/exercises/quadris/legpress-trenó-foco-gluteos.gif";
    if (n.includes("rosca direta")) return "/exercises/antebraços/rosca-direta-com-barra-em-pé.gif";
    if (n.includes("arnold")) return "/exercises/Ombros/arnold-halteres.gif";
    if (n.includes("puxada") || n.includes("pulldown")) return "/exercises/Ombros/puxada-alta-com-barra.gif";
    if (n.includes("remada")) return "/exercises/Ombros/remada-vertical-barra.gif";
    if (n.includes("elevação de quadril") || n.includes("hip thrust")) return "/exercises/quadris/elevação-quadril-barra.gif";

    // If it's already local, keep it
    if (currentUrl?.startsWith('/exercises/')) return currentUrl;

    // Fallback to current URL if no mapping found
    return currentUrl || "";
};
