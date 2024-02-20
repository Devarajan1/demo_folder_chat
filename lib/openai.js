export async function apikeyFun(apiKey){
    try {
        const response = await fetch("/api/manage/admin/genai-api-key", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ api_key: apiKey }),
          });
          return response
    } catch (error) {
        console.log(error)
    }   
};

export async function fetchApiKey(){
    try {
        const res = await fetch('/api/manage/admin/genai-api-key')
        return res
    } catch (error) {
        console.log(error)
    }
  }

  export async function deleteApiKey(){
    try {
        const res = await fetch('/api/manage/admin/genai-api-key', {
            method: "DELETE"
        })
        window.location.reload()
        return res
    } catch (error) {
        console.log(error)
    }
  }