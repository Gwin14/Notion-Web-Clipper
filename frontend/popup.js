document.addEventListener("DOMContentLoaded", () => {
  const authBtn = document.getElementById("auth");
  const clipBtn = document.getElementById("clip");
  const dbSelect = document.getElementById("databaseSelect");
  const status = document.getElementById("status");

  let token = null;

  chrome.storage.local.get(
    ["notion_token", "notion_database_id"],
    async (result) => {
      token = result.notion_token;

      if (token) {
        clipBtn.disabled = false;
        status.textContent = "Autenticado ✅";

        const res = await fetch("https://api.notion.com/v1/search", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "Notion-Version": "2022-06-28",
          },
          body: JSON.stringify({
            filter: {
              property: "object",
              value: "database",
            },
          }),
        });

        const data = await res.json();
        dbSelect.innerHTML = "";

        data.results.forEach((db) => {
          const nameProp = db.title?.[0]?.plain_text || "Sem título";
          const option = document.createElement("option");
          option.value = db.id;
          option.textContent = nameProp;
          dbSelect.appendChild(option);
        });

        if (result.notion_database_id) {
          dbSelect.value = result.notion_database_id;
        }

        dbSelect.onchange = () => {
          chrome.storage.local.set({ notion_database_id: dbSelect.value });
        };
      }
    }
  );

  authBtn.onclick = () => {
    const authUrl = "http://localhost:8000/auth/login/";
    window.open(authUrl, "_blank");
  };

  clipBtn.onclick = async () => {
    const databaseId = dbSelect.value;

    if (!databaseId) {
      status.textContent = "Escolha uma database primeiro.";
      return;
    }

    chrome.storage.local.set({ notion_database_id: databaseId });

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];

      fetch("https://api.notion.com/v1/pages", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "Notion-Version": "2022-06-28",
        },
        body: JSON.stringify({
          parent: { database_id: databaseId },
          properties: {
            Nome: {
              title: [
                {
                  text: {
                    content: tab.title,
                  },
                },
              ],
            },
            URL: {
              url: tab.url,
            },
          },
        }),
      }).then((res) => {
        if (res.ok) {
          status.textContent = "Página salva com sucesso ✅";
        } else {
          status.textContent = "Erro ao salvar ❌";
        }
      });
    });
  };
});
