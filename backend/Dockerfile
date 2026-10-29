FROM maven:3.9-eclipse-temurin-21 AS build

WORKDIR /app

COPY pom.xml .
COPY src ./src

RUN mvn clean package -DskipTests

FROM eclipse-temurin:21-jre

WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

# Hugging Face lance le conteneur avec un utilisateur non-root (uid 1000) :
# on rend /app accessible en écriture (dossier uploads, fichiers temporaires)
RUN mkdir -p /app/uploads && chmod -R 777 /app

# Hugging Face attend l'application sur le port 7860
EXPOSE 7860

ENTRYPOINT ["sh", "-c", "java -XX:MaxRAMPercentage=50 -Dserver.port=${PORT:-7860} -jar app.jar"]
