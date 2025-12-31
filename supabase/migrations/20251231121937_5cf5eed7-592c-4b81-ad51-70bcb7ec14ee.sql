-- Add test data for device 1100025
UPDATE complaints 
SET repair_cost = 150.00, 
    diagnosis = 'Uszkodzony moduł GPS i antena GSM', 
    service_notes = 'Wymieniono antenę GPS oraz moduł GSM. Urządzenie przetestowane pomyślnie.'
WHERE device_serial_number = '1100025' AND status = 'completed';

-- Add test parts
INSERT INTO complaint_parts (complaint_id, spare_part_id, spare_part_name, spare_part_price)
SELECT 
  '6cbe583c-8484-4fec-988b-ec3ab165dff4',
  '5b9913e5-c272-4305-9b18-ffd81fc8137c',
  'antena GPS(GT, GTR, XS, RS, F)',
  20.00
ON CONFLICT (complaint_id, spare_part_id) DO NOTHING;

INSERT INTO complaint_parts (complaint_id, spare_part_id, spare_part_name, spare_part_price)
SELECT 
  '6cbe583c-8484-4fec-988b-ec3ab165dff4',
  'bde003ea-d961-48f4-9062-8be6360a4a19',
  'guz',
  50.00
ON CONFLICT (complaint_id, spare_part_id) DO NOTHING;