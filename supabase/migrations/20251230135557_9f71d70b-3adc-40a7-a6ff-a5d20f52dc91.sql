-- Insert 10 random test complaints for testing
INSERT INTO public.complaints (
  user_id, warranty_repair, express_repair, device_serial_number, device_type, 
  damage_description, return_first_name, return_last_name, return_street, 
  return_postal_code, return_city, return_phone, return_email, status,
  internal_complaint_number, submission_date, package_device
) VALUES
-- Warranty repairs (unassigned - for testing "Pobierz naprawę")
('729022dd-da6f-44d0-9a8e-882b40f7dfea', true, true, 'SN-RS-001234', 'Yanosik RS', 'Uszkodzony wyświetlacz', 'Jan', 'Kowalski', 'ul. Główna 15', '00-001', 'Warszawa', '500100200', 'jan@test.pl', 'submitted', 'RMA-2024-0001', now() - interval '5 days', true),
('729022dd-da6f-44d0-9a8e-882b40f7dfea', true, false, 'SN-GT-005678', 'Yanosik GT/GTR/GTS', 'Nie ładuje się bateria', 'Anna', 'Nowak', 'ul. Parkowa 8', '30-002', 'Kraków', '500200300', 'anna@test.pl', 'submitted', 'RMA-2024-0002', now() - interval '10 days', true),
('1486a852-50ce-4250-968d-5ecd0c79181e', true, false, 'SN-XS-009012', 'Yanosik XS', 'Brak sygnału GPS', 'Piotr', 'Wiśniewski', 'ul. Leśna 22', '50-003', 'Wrocław', '500300400', 'piotr@test.pl', 'submitted', 'RMA-2024-0003', now() - interval '3 days', true),
('1486a852-50ce-4250-968d-5ecd0c79181e', true, true, 'SN-GTM-003456', 'Yanosik GTM', 'Pęknięta obudowa', 'Maria', 'Dąbrowska', 'ul. Słoneczna 5', '60-004', 'Poznań', '500400500', 'maria@test.pl', 'awaiting_shipment', 'RMA-2024-0004', now() - interval '7 days', true),
('4f6443ee-b599-43f1-a45a-28accc1785f4', true, false, 'SN-AL-007890', 'Yanosik Alert', 'Problem z głośnikiem', 'Tomasz', 'Lewandowski', 'ul. Morska 12', '80-005', 'Gdańsk', '500500600', 'tomasz@test.pl', 'submitted', 'RMA-2024-0005', now() - interval '15 days', true),

-- Non-warranty repairs
('4f6443ee-b599-43f1-a45a-28accc1785f4', false, false, 'SN-CON-002345', 'Yanosik Connect', 'Uszkodzona klawiatura', 'Karolina', 'Zielińska', 'ul. Kwiatowa 3', '90-006', 'Łódź', '500600700', 'karolina@test.pl', 'in_progress', 'RMA-2024-0006', now() - interval '2 days', true),
('9052957b-0438-46f2-932b-65333c476cb6', false, true, 'SN-RS-006789', 'Yanosik RS', 'Wymiana ekranu', 'Michał', 'Szymański', 'ul. Ogrodowa 18', '40-007', 'Katowice', '500700800', 'michal@test.pl', 'submitted', 'RMA-2024-0007', now() - interval '1 day', true),
('9052957b-0438-46f2-932b-65333c476cb6', false, false, 'SN-GT-001122', 'Yanosik GT/GTR/GTS', 'Nie włącza się', 'Agnieszka', 'Woźniak', 'ul. Jasna 7', '20-008', 'Lublin', '500800900', 'agnieszka@test.pl', 'completed', 'RMA-2024-0008', now() - interval '20 days', true),
('729022dd-da6f-44d0-9a8e-882b40f7dfea', true, false, 'SN-XS-003344', 'Yanosik XS', 'Problem z modułem GSM', 'Robert', 'Kamiński', 'ul. Cicha 25', '70-009', 'Szczecin', '500900100', 'robert@test.pl', 'submitted', 'RMA-2024-0009', now() - interval '12 days', true),
('1486a852-50ce-4250-968d-5ecd0c79181e', true, true, 'SN-RS-005566', 'Yanosik RS', 'Uszkodzony port USB', 'Ewa', 'Pawlak', 'ul. Szeroka 11', '10-010', 'Bydgoszcz', '500100100', 'ewa@test.pl', 'submitted', 'RMA-2024-0010', now() - interval '8 days', true);