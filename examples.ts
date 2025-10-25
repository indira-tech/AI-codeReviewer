export const EXAMPLES: { [key: string]: string } = {
  javascript: `// This function calculates the total price of items in a shopping cart.
// It contains a bug where it tries to access 'item.cost' instead of 'item.price'.
function calculateTotal(cart) {
  let total = 0;
  for (const item of cart) {
    total += item.cost; // Bug: Should be item.price
  }
  return total;
}

const shoppingCart = [
  { "name": "Laptop", "price": 1200 },
  { "name": "Mouse", "price": 25 }
];

// This will result in NaN because 'cost' is undefined.
const result = calculateTotal(shoppingCart);
console.log("Total price:", result);`,

  typescript: `interface User {
  id: number;
  name: string;
  email?: string; // Optional property
}

function displayUser(user: User): void {
  console.log(\`ID: \${user.id}, Name: \${user.name}\`);
  if (user.email) {
    console.log(\`Email: \${user.email}\`);
  }
}

const user1: User = { id: 1, name: 'Alice' };
displayUser(user1);`,

  python: `class Dog:
    def __init__(self, name, age):
        self.name = name
        self.age = age

    def bark(self):
        return "Woof!"

    # Inefficient way to greet
    def greet(self):
        greeting = ""
        for char in "Hello, my name is ":
            greeting += char
        greeting += self.name
        return greeting

my_dog = Dog("Buddy", 5)
print(my_dog.greet())`,

  java: `public class Calculator {
    
    // A method to add two integers
    public static int add(int a, int b) {
        return a + b;
    }

    // A potential issue: integer division
    public static int divide(int a, int b) {
        // This will truncate the result for non-even divisions
        // And throws an exception if b is 0
        return a / b;
    }
    
    public static void main(String[] args) {
        System.out.println("Addition: " + add(5, 3));
        System.out.println("Division: " + divide(10, 4));
    }
}`,

  csharp: `using System;

public class Greeter
{
    public static void Main(string[] args)
    {
        string name = "World";
        if (args.Length > 0) {
            name = args[0];
        }
        Console.WriteLine("Hello, " + name + "!");
    }
    
    // This method is never used.
    private void UnusedMethod()
    {
        Console.WriteLine("This is a redundant method.");
    }
}`,

  c: `#include <stdio.h>
#include <string.h>

// This function has a buffer overflow vulnerability
void vulnerable_copy(char* input) {
    char buffer[10];
    strcpy(buffer, input); // No bounds checking!
    printf("Copied string: %s\\n", buffer);
}

int main() {
    char* long_string = "This string is definitely too long for the buffer";
    vulnerable_copy(long_string);
    return 0;
}`,

  cpp: `#include <iostream>
#include <vector>
#include <string>

class Vehicle {
public:
    virtual void drive() {
        std::cout << "The vehicle is moving." << std::endl;
    }
};

class Car : public Vehicle {
public:
    void drive() override {
        std::cout << "The car is driving on the road." << std::endl;
    }
};

int main() {
    Vehicle* v = new Vehicle();
    Vehicle* c = new Car();
    
    v->drive();
    c->drive();
    
    // Memory leak: 'v' and 'c' are not deleted.
    // delete v;
    // delete c;
    
    return 0;
}`,

  go: `package main

import "fmt"

func main() {
    // Using a fixed-size array
    primes := [5]int{2, 3, 5, 7, 11}
    
    // A classic off-by-one error
    for i := 0; i <= len(primes); i++ {
        fmt.Println(primes[i])
    }
}`,

  rust: `fn main() {
    let mut s = String::from("hello");
    
    // This creates a dangling reference if we're not careful.
    // Rust's borrow checker will prevent this code from compiling.
    let r1 = &s; 
    let r2 = &s;
    
    // The line below would cause a compile error because you can't have a mutable
    // borrow while immutable borrows exist.
    // s.push_str(", world!"); 
    
    println!("{} and {}", r1, r2);

    // This is fine because the immutable borrows r1 and r2 are no longer used.
    s.push_str(", world!");
    println!("{}", s);
}`,

  ruby: `class User
  attr_accessor :name, :email

  def initialize(attributes = {})
    @name  = attributes[:name]
    @email = attributes[:email]
  end

  # This is a very inefficient way to format an address
  def formatted_address
    "#{name} <#{email}>"
  end
end

user = User.new(name: "John Doe", email: "john.doe@example.com")
puts user.formatted_address`,

  php: `<?php
// Using a global variable is generally bad practice.
$config = ['db_host' => 'localhost'];

function connect_to_db() {
  global $config;
  echo "Connecting to " . $config['db_host'];
  // The connection logic would go here.
}

// SQL Injection vulnerability
$user_id = $_GET['id']; // Unsanitized user input
$query = "SELECT * FROM users WHERE id = " . $user_id;

echo "Executing query: " . $query;
?>`,

  html: `<!DOCTYPE html>
<html>
<head>
    <title>My Page</title>
</head>
<body>
    <h1>Welcome</H1> <!-- Mismatched closing tag -->
    
    <!-- Using deprecated 'b' tag for bolding instead of 'strong' -->
    <p>This is some <b>important</b> text.</p>
    
    <!-- Image without an alt attribute -->
    <img src="photo.jpg">
</body>
</html>`,

  css: `/* Redundant and inefficient selector */
div.main-content p.intro {
  color: #333;
}

/* Using pixels for font size is less accessible than rem or em */
.title {
  font-size: 24px;
  font-weight: bold;
}

/* No vendor prefixes for older browser compatibility */
.box {
  transform: rotate(10deg);
}`,

  sql: `SELECT
    u.user_id,
    u.user_name,
    p.product_name
FROM
    Users u, -- Deprecated comma-style join
    Orders o,
    Products p
WHERE
    u.user_id = o.user_id
    AND o.product_id = p.product_id
    AND u.user_id = 123;
-- This could be rewritten with explicit JOIN syntax for better readability.`,

  shell: `#!/bin/bash
# A simple script to greet a user and list files.

echo "Enter your name:"
read NAME

echo "Hello, $NAME!"
echo "Listing files in the current directory:"
ls -la`,

  json: `{
  "user": {
    "id": 101,
    "name": "John Doe",
    "email": "john.doe@example.com",
    "isActive": true,
    "roles": [
      "admin",
      "editor"
    ],
    "address": null
  }
}`,

  yaml: `server:
  port: 8080
  host: "127.0.0.1"

database:
  type: "postgresql"
  user: "admin"
  # Avoid storing passwords in plaintext files.
  password: "password123" 
  
feature_flags:
  - new_dashboard
  - experimental_api`,

  markdown: `# My Document

This is a sample Markdown document.

## Features
- List item one
- List item two

\`\`\`javascript
// It can even contain code blocks
console.log("Hello, Markdown!");
\`\`\``,
};