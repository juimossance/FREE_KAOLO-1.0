FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

# Dépendances en cache : ne se retéléchargent que si le pom.xml change
COPY pom.xml .
RUN mvn -B -q dependency:go-offline

COPY src ./src
RUN mvn -B -q clean package -DskipTests

FROM eclipse-temurin:21-jre
WORKDIR /app

COPY --from=build --chown=1000:1000 /app/target/*.jar app.jar
RUN mkdir -p /app/uploads && chown -R 1000:1000 /app

# uid 1000 = utilisateur imposé par Hugging Face (pas de chmod 777)
USER 1000:1000

ENV SPRING_PROFILES_ACTIVE=prod
EXPOSE 7860

# exec : Java reçoit SIGTERM et s'arrête proprement
ENTRYPOINT ["sh", "-c", "exec java -XX:MaxRAMPercentage=75 -Dserver.port=${PORT:-7860} -jar app.jar"]
