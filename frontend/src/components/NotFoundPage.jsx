import { Container, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Header from "./Header";

const NotFoundPage = () => {
  const { t } = useTranslation();

  return (
    <div className="h-100 bg-light">
      <Header />
      <Container className="h-100 d-flex justify-content-center align-items-center">
        <div className="text-center">
          <h1 className="display-1 text-muted">404</h1>
          <h2 className="mb-4">{t("notFound.title")}</h2>
          <p className="text-muted mb-4">{t("notFound.description")}</p>
          <Button as={Link} to="/" variant="primary">
            {t("notFound.goHome")}
          </Button>
        </div>
      </Container>
    </div>
  );
};

export default NotFoundPage;
