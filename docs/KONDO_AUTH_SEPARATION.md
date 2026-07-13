# Kondo Auth Separation

## Sender Login

Sender users log in at:

```text
/login
```

Allowed role:

- `SENDER`

If an `ADMIN` or `SUPER_ADMIN` uses `/login`, authentication is rejected with:

```text
Ce compte est un compte administrateur. Veuillez utiliser l’accès administrateur.
```

No session cookie is set for the wrong portal.

## Admin Login

Admin and super admin users log in at:

```text
/admin/login
```

Allowed roles:

- `ADMIN`
- `SUPER_ADMIN`

If a `SENDER` uses `/admin/login`, authentication is rejected with:

```text
Ce compte est un compte utilisateur. Veuillez utiliser la connexion client.
```

No session cookie is set for the wrong portal.

## Public Registration

The public registration page has no role selector. `POST /api/auth/register` always creates a `SENDER` account server-side and ignores any role sent by the client.

## Route Protection

- Sender dashboard and transfer creation pages require `SENDER`.
- Admin pages require `ADMIN` or `SUPER_ADMIN`.
- Admin management remains limited to `SUPER_ADMIN`.

The same password/JWT auth service is reused, but each login page sends a portal context so the API can enforce the allowed roles.
