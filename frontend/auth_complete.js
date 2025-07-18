const params = new URLSearchParams(window.location.hash.substring(1));
const token = params.get("access_token");

if (token) {
  chrome.runtime.sendMessage({ type: "store_token", token });
  document.getElementById("status").textContent =
    "Autenticado com sucesso. Pode fechar esta aba.";
} else {
  document.getElementById("status").textContent = "Erro ao autenticar.";
}
