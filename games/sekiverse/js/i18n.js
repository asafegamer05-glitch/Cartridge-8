const I18N = {
    pt: {
        langBtn: "🇺🇸 EN",
        play: "Play",
        options: "⚙ Opções",
        portfolio: "🌐 Portfólio",
        madeBy: "Feito por asafgamer",
        continue: "Continuar",
        badgesBtn: "🏆 Badges",
        badgesTitle: "Conquistas",
        back: "Voltar",
        optionsTitle: "⚙ Opções",
        exportSave: "📥 Exportar Save (.json)",
        importSave: "📤 Importar Save",
        clearSave: "🗑️ Apagar Progresso",
        saveTip: "💾 Você pode exportar e importar seu save! Abra o menu de <strong>Opções</strong> e vá até o final.",
        areaComplete: "✓ Área Completa",
        useful: "ÚTIL!",
        runs: "🎮 Runs: ",
        endings: "🏁 Finais: ",
        best: "⏱️ Melhor: ",
        clicks: "clicks",
        errors: "❌ Erros: ",
        playAgain: "Jogar Novamente",
        streak: "🔥 STREAK x",
        lockHint: "🔒 Algo está diferente... tente novamente para descobrir o verdadeiro final.",
        confirmClear: "Apagar TODO o progresso? Essa ação não pode ser desfeita!",
        saveCleared: "Save apagado. Recarregando...",
        saveImported: "✓ Save importado! Recarregando...",
        invalidFile: "✗ Arquivo inválido!"
    },
    en: {
        langBtn: "🇧🇷 PT",
        play: "Play",
        options: "⚙ Options",
        portfolio: "🌐 Portfolio",
        madeBy: "Made by asafgamer",
        continue: "Continue",
        badgesBtn: "🏆 Badges",
        badgesTitle: "Achievements",
        back: "Back",
        optionsTitle: "⚙ Options",
        exportSave: "📥 Export Save (.json)",
        importSave: "📤 Import Save",
        clearSave: "🗑️ Erase Progress",
        saveTip: "💾 You can export and import your save! Open the <strong>Options</strong> menu and go to the bottom.",
        areaComplete: "✓ Area Complete",
        useful: "USEFUL!",
        runs: "🎮 Runs: ",
        endings: "🏁 Endings: ",
        best: "⏱️ Best: ",
        clicks: "clicks",
        errors: "❌ Errors: ",
        playAgain: "Play Again",
        streak: "🔥 STREAK x",
        lockHint: "🔒 Something is different... try again to discover the true ending.",
        confirmClear: "Erase ALL progress? This action cannot be undone!",
        saveCleared: "Save erased. Reloading...",
        saveImported: "✓ Save imported! Reloading...",
        invalidFile: "✗ Invalid file!"
    }
};

window.currentLang = localStorage.getItem('sekiverse_lang') || 'pt';
window.t = (key) => I18N[window.currentLang][key] || key;

function applyHTMLTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        if (el.dataset.i18n === 'saveTip') {
            el.innerHTML = t(el.dataset.i18n);
        } else {
            el.textContent = t(el.dataset.i18n);
        }
    });
}
