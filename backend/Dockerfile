# ===== Stage 1: Build =====
FROM eclipse-temurin:25-jdk AS builder
WORKDIR /app

# Copy Maven wrapper and pom.xml first for layer caching
COPY mvnw pom.xml ./
COPY .mvn .mvn
RUN chmod +x mvnw && ./mvnw dependency:go-offline -B

# Copy source and build
COPY src ./src
RUN ./mvnw package -DskipTests -B

# ===== Stage 2: Runtime =====
FROM eclipse-temurin:25-jre AS runtime
WORKDIR /app

# Install psql client and bash for entrypoint script
RUN apt-get update && apt-get install -y --no-install-recommends postgresql-client bash && rm -rf /var/lib/apt/lists/*

# Copy the built JAR
COPY --from=builder /app/target/*.jar app.jar

# Copy SQL seed and entrypoint
COPY sql/import.sql /app/sql/import.sql
COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

EXPOSE 8081

ENTRYPOINT ["/app/docker-entrypoint.sh"]
