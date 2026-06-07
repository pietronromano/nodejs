    # Context Diagram
 ```mermaid
flowchart LR
    %% External Entities (Users & Systems)
    Customer((Customer))
    Admin[Store Administrator]
    Bank[(Payment Gateway)]
    Logistics[/Shipping Provider/]

    %% Central System Boundary
    subgraph System_Boundary [E-Commerce Platform]
        CoreSystem[Core Application Server]
    end

    %% Data Flows & Relationships
    Customer -->|Places order / Pays| CoreSystem
    CoreSystem -->|Sends receipts / Updates| Customer
    
    Admin -->|Manages inventory| CoreSystem
    CoreSystem -->|Reports sales analytics| Admin
    
    CoreSystem <==>|Processes credit card transactions| Bank
    CoreSystem -->|Fulfills shipping orders| Logistics
    CoreSystem -->|Enqueues transactions| TransactionQueue([Transaction Queue])
    Logistics -->|Sends tracking info| CoreSystem

    %% Visual Styling Configuration
    style System_Boundary fill:#f9f9f9,stroke:#333,stroke-width:2px,stroke-dasharray: 5 5
    style CoreSystem fill:#bbf,stroke:#333,stroke-width:3px
    style Customer fill:#fff,stroke:#333,stroke-width:2px
    style Bank fill:#fff,stroke:#333,stroke-width:2px

```
