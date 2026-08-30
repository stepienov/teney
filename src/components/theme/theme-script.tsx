const THEME_BOOTSTRAP = `(function(){try{var stored=localStorage.getItem("teney-theme");var theme=stored==="light"||stored==="dark"?stored:(window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");if(theme==="dark")document.documentElement.classList.add("dark");else document.documentElement.classList.remove("dark");document.documentElement.style.colorScheme=theme;}catch(e){}})();`;

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP }} />;
}
