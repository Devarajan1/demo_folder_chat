// should be used client-side only
export const getCurrentUser = async () => {
  const response = await fetch("/api/manage/me", {
    credentials: "include",
  });
  if (!response.ok) {
    return null;
  }
  const user = await response.json();
  return user;
};

export const logout = async () => {
  const response = await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
  });
  return response;
};

export const basicLogin = async (
  email,
  password
) => {
  const params = new URLSearchParams([
    ["username", email],
    ["password", password],
  ]);
  const response = await fetch("/api/auth/login", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params,
  });
  return response;
};

export const basicSignup = async (email, password) => {
  const response = await fetch("/api/auth/register", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      username: email,
      password,
    }),
  });
  return response;
};


export async function deleteUser(email){
  try {
      const res = await fetch('/api/manage/delete-user', {
        method: 'DELETE',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_email:email
        })
      });
      return res
      
      
  } catch (error) {
      console.log('error', error)
  }
};


export async function promoteUser(email){
  try {
    const res = await fetch(
      "/api/manage/promote-user-to-admin",
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_email: email,
        }),
      }
    );
    return res
  } catch (error) {
    console.log(error)
  }
}

export async function getAllUsers(){
  try {
      const res = await fetch('/api/manage/users');
      const json = await res.json();
      
      return json
  } catch (error) {
      console.log('error', error)
  }
};

