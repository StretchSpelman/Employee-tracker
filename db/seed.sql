INSERT INTO department (name) VALUES
('Human Resources'),
('Finances'),
('IT'),
('Marketing'),
('Operations');


INSERT INTO roles (title, salary, department_id) VALUES
('Human Resources Manager', 65000.00, 1),
('Financial Analyst', 55000.00, 2),
('Software Developer', 75000.00, 3),
('Marketing Specialist', 70000.00, 4),
('Operations Manager', 80000.00, 5);


INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES
('Stretch','Spelman',1,NULL),
('Nicole', 'Spelman', 2,1),        
('John', 'Doe', 3, 1),   
('Jane', 'Doe', 4, 1), 
('Mike', 'Spelman', 5, 1); 