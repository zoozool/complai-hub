# System Zarządzania Reklamacjami Serwisowymi

Nowoczesna aplikacja webowa do zarządzania reklamacjami serwisowymi, zamówieniami kurierskimi i odbiorem urządzeń. Zbudowana z użyciem React, TypeScript i Supabase.

## 🚀 Funkcjonalności

- **Autentykacja użytkowników**: Bezpieczne logowanie/rejestracja z e-mailem, resetowanie hasła i opcja "Zapamiętaj mnie"
- **Zarządzanie reklamacjami**: Zgłaszanie, śledzenie i zarządzanie reklamacjami serwisowymi
- **Panel administratora**: Kompleksowy panel do zarządzania użytkownikami, reklamacjami i ustawieniami
- **Przyjęcie urządzenia**: Przyjmowanie i rejestracja urządzeń w serwisie z weryfikacją zawartości paczki
- **Weryfikacja urządzenia**: Weryfikacja naprawionych urządzeń (zasilanie, GPS, GSM, dźwięk)
- **Naprawy gwarancyjne**: Dedykowany przepływ pracy dla serwisantów do obsługi napraw gwarancyjnych
- **Śledzenie części**: Śledzenie części zamiennych użytych w każdej naprawie z kalkulacją kosztów
- **Zamówienia kurierskie**: Zamawianie usług kurierskich do wysyłki urządzeń
- **Planowanie odbiorów**: Planowanie odbiorów urządzeń do naprawy
- **Kontrola dostępu**: Różne poziomy dostępu dla administratorów, pracowników i serwisantów
- **Profile użytkowników**: Zarządzanie danymi osobowymi i firmowymi
- **Wielojęzyczność**: Konfigurowalne tłumaczenia elementów interfejsu

## 🛠️ Stack technologiczny

- **Frontend**: React 18, TypeScript, Vite
- **Stylowanie**: Tailwind CSS, komponenty shadcn/ui
- **Backend**: Supabase (PostgreSQL, Autentykacja, Edge Functions)
- **Zarządzanie stanem**: TanStack React Query
- **Routing**: React Router DOM
- **Formularze**: React Hook Form z walidacją Zod

## 📋 Wymagania

- Node.js (v18 lub wyższy)
- npm lub bun
- Konto Supabase (dla usług backendowych)

## 🔧 Instalacja

1. **Sklonuj repozytorium**
   ```bash
   git clone <YOUR_GIT_URL>
   cd <YOUR_PROJECT_NAME>
   ```

2. **Zainstaluj zależności**
   ```bash
   npm install
   # lub
   bun install
   ```

3. **Uruchom serwer deweloperski**
   ```bash
   npm run dev
   # lub
   bun run dev
   ```

4. **Otwórz przeglądarkę**
   Przejdź do `http://localhost:5173`

## 🗄️ Schemat bazy danych

### Tabele

| Tabela | Opis |
|--------|------|
| `profiles` | Informacje o profilu użytkownika |
| `complaints` | Rekordty reklamacji serwisowych |
| `complaint_parts` | Części użyte w naprawach |
| `complaint_status_history` | Historia zmian statusów |
| `courier_orders` | Zamówienia kurierskie |
| `pickup_requests` | Zaplanowane odbiory urządzeń |
| `user_roles` | Przypisania ról użytkowników |
| `service_options` | Dostępne opcje serwisowe |
| `package_contents` | Definicje zawartości paczek |
| `spare_parts` | Magazyn części zamiennych |
| `translations` | Tłumaczenia interfejsu |

### Role użytkowników

| Rola | Opis |
|------|------|
| `main_administrator` | Pełny dostęp do systemu |
| `employee` | Standardowy dostęp pracownika (przyjęcie, weryfikacja, odbiory) |
| `service_technician` | Dostęp serwisanta (naprawy gwarancyjne, diagnoza) |

### Statusy reklamacji

| Status | Opis |
|--------|------|
| `submitted` | Zgłoszono - wstępne zgłoszenie |
| `received` | W serwisie - urządzenie przyjęte |
| `in_progress` | W naprawie - trwa naprawa |
| `completed` | Zakończono - naprawa ukończona |
| `verified` | Zweryfikowano - urządzenie sprawdzone po naprawie |
| `awaiting_shipment` | Oczekuje na wysyłkę |
| `cancelled` | Anulowano |

## 📁 Struktura projektu

```
src/
├── components/
│   ├── admin/          # Komponenty administracyjne
│   │   ├── ComplaintTable.tsx      # Tabela reklamacji
│   │   ├── TechnicianRepairView.tsx # Widok naprawy dla serwisanta
│   │   ├── SearchFilters.tsx       # Filtry wyszukiwania
│   │   └── ...
│   └── ui/             # Komponenty UI (shadcn)
├── hooks/              # Własne hooki React
│   ├── useAuth.tsx     # Hook autentykacji
│   ├── useRole.tsx     # Hook zarządzania rolami
│   ├── useComplaintDetails.ts # Hook szczegółów reklamacji
│   └── useTranslations.tsx # Wielojęzyczność
├── integrations/
│   └── supabase/       # Klient i typy Supabase
├── pages/
│   ├── admin/          # Strony administracyjne
│   │   ├── AdminDashboard.tsx  # Główny panel administratora
│   │   ├── AcceptDevice.tsx    # Przyjęcie urządzenia
│   │   ├── VerifyDevice.tsx    # Weryfikacja urządzenia
│   │   ├── WarrantyRepairs.tsx # Zarządzanie naprawami gwarancyjnymi
│   │   ├── ScheduledPickups.tsx # Zaplanowane odbiory
│   │   ├── UserManagement.tsx  # Zarządzanie użytkownikami
│   │   └── ComplaintSettings.tsx # Konfiguracja ustawień
│   ├── Auth.tsx        # Strona autentykacji
│   ├── Dashboard.tsx   # Panel użytkownika
│   ├── NewComplaint.tsx # Zgłaszanie reklamacji
│   ├── Profile.tsx     # Profil użytkownika
│   └── ...
└── lib/                # Funkcje pomocnicze

supabase/
└── functions/
    ├── get-complaint/           # Pobieranie szczegółów reklamacji
    └── get-complaints-by-serial/ # Wyszukiwanie reklamacji po numerze seryjnym
```

## 🔌 API - Edge Functions

### Podsumowanie endpointów

| Endpoint | Metoda | Opis |
|----------|--------|------|
| `/functions/v1/get-complaint` | POST | Pobierz szczegóły reklamacji po ID |
| `/functions/v1/get-complaints-by-serial` | GET/POST | Wyszukaj reklamacje po numerze seryjnym urządzenia |

---

### GET Complaint - Pobierz szczegóły reklamacji

Pobiera szczegółowe informacje o konkretnej reklamacji. **Dostęp: Administrator, Pracownik.**

**Endpoint:** `POST /functions/v1/get-complaint`

**Nagłówki:**
```
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "complaintId": "uuid-reklamacji"
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "device_type": "string",
  "device_serial_number": "string",
  "damage_description": "string",
  "status": "submitted | received | in_progress | completed | verified | awaiting_shipment | cancelled",
  "assigned_technician_id": "uuid | null",
  "diagnosis": "string | null",
  "repair_cost": "number | null",
  "service_notes": "string | null",
  "warranty_repair": "boolean",
  "submission_date": "timestamp",
  "completion_date": "timestamp | null",
  ...
}
```

**Kody błędów:**
| Kod | Opis |
|-----|------|
| 401 | Brak lub nieprawidłowy token JWT |
| 403 | Brak wymaganych uprawnień |
| 404 | Reklamacja nie znaleziona |
| 400 | Brak ID reklamacji |

---

### GET Complaints by Serial - Wyszukaj reklamacje po numerze seryjnym

Wyszukuje listę reklamacji pasujących do numeru seryjnego urządzenia. **Dostęp: Administrator, Pracownik, Serwisant.**

**Endpoint:** `GET /functions/v1/get-complaints-by-serial?serial_number=ABC123`

lub

**Endpoint:** `POST /functions/v1/get-complaints-by-serial`

**Nagłówki:**
```
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Query Parameters (GET):**
| Parametr | Typ | Wymagany | Opis |
|----------|-----|----------|------|
| serial_number | string | Tak | Numer seryjny urządzenia (wyszukiwanie częściowe) |

**Request Body (POST):**
```json
{
  "serial_number": "ABC123"
}
```

**Response (200):**
```json
{
  "complaints": [
    {
      "id": "uuid",
      "internal_complaint_number": "string | null",
      "device_serial_number": "string",
      "device_type": "string",
      "status": "submitted | received | in_progress | completed | verified | awaiting_shipment | cancelled",
      "warranty_repair": "boolean",
      "damage_description": "string",
      "reported_problem": "string | null",
      "diagnosis": "string | null",
      "repair_cost": "number | null",
      "submission_date": "timestamp",
      "completion_date": "timestamp | null",
      "assigned_technician_id": "uuid | null",
      "return_first_name": "string",
      "return_last_name": "string",
      "return_email": "string",
      "return_phone": "string"
    }
  ],
  "count": 1
}
```

**Kody błędów:**
| Kod | Opis |
|-----|------|
| 401 | Brak lub nieprawidłowy token JWT |
| 403 | Brak wymaganych uprawnień |
| 400 | Brak parametru serial_number |
| 500 | Błąd serwera |

**Przykłady użycia:**

```bash
# GET request
curl -X GET \
  'https://hcvgidsazfbeqbkszqdf.supabase.co/functions/v1/get-complaints-by-serial?serial_number=ABC123' \
  -H 'Authorization: Bearer <token>'

# POST request
curl -X POST \
  'https://hcvgidsazfbeqbkszqdf.supabase.co/functions/v1/get-complaints-by-serial' \
  -H 'Authorization: Bearer <token>' \
  -H 'Content-Type: application/json' \
  -d '{"serial_number": "ABC123"}'
```

---

## 🔐 Autentykacja

Aplikacja wykorzystuje Supabase Authentication z następującymi funkcjami:

- Logowanie i rejestracja przez email/hasło
- Reset hasła przez email
- Funkcja "Zapamiętaj mnie"
- Chronione trasy oparte na rolach użytkowników

### Testowe konta

| Email | Rola |
|-------|------|
| admin@neptis.pl | main_administrator |
| employee@neptis.pl | employee |
| technician@neptis.pl | service_technician |

## 🚢 Wdrożenie

### Przez Lovable

1. Otwórz [Lovable](https://lovable.dev/projects/e569bdca-1959-45fb-9c1e-460ae06bf4c9)
2. Kliknij **Share → Publish**

### Własna domena

1. Przejdź do **Project → Settings → Domains**
2. Kliknij **Connect Domain**
3. Postępuj zgodnie z instrukcjami konfiguracji DNS

## 🔄 Przepływ pracy

### Zmiany przez Lovable

Zmiany wprowadzone w Lovable są automatycznie commitowane do podłączonego repozytorium GitHub.

### Zmiany przez IDE

1. Sklonuj repozytorium
2. Wprowadź zmiany lokalnie
3. Wypchnij do GitHub
4. Zmiany synchronizują się automatycznie do Lovable

## 📝 Zmienne środowiskowe

Aplikacja używa Supabase jako backendu. Następujące zmienne są konfigurowane automatycznie:

- `SUPABASE_URL` - URL projektu Supabase
- `SUPABASE_ANON_KEY` - Klucz anonimowy Supabase
- `SUPABASE_SERVICE_ROLE_KEY` - Klucz serwisowy (tylko Edge Functions)

## 🤝 Wkład w projekt

1. Sforkuj repozytorium
2. Utwórz branch funkcjonalności (`git checkout -b feature/nowa-funkcja`)
3. Zacommituj zmiany (`git commit -m 'Dodaj nową funkcję'`)
4. Wypchnij branch (`git push origin feature/nowa-funkcja`)
5. Otwórz Pull Request

## 📄 Licencja

Ten projekt jest prywatny i własnościowy.

## 🆘 Wsparcie

W razie potrzeby wsparcia skontaktuj się z administratorem projektu lub otwórz issue w repozytorium GitHub.

---

Zbudowano z ❤️ używając [Lovable](https://lovable.dev)
