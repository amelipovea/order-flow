# OrderFlow - Pedidos y Promociones

Sistema modular desarrollado con Java 17, Maven y Apache Karaf 4.4.

## Arquitectura

El proyecto utiliza OSGi y dos bundles funcionales:

- Order Service: administra pedidos y publica OrderService.
- Promotion Engine: consume OrderService y evalua promociones.

## Tecnologias

- Java 17
- Apache Maven 3.10
- Apache Karaf 4.4.12
- OSGi Declarative Services
- Apache Felix Maven Bundle Plugin

## Modulos

- order-service
- promotion-engine

## Estado

Proyecto en desarrollo.