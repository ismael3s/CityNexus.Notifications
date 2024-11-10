import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Preview,
  Text,
} from '@react-email/components';
import * as React from 'react';
import { CSSProperties } from 'react';

interface KoalaWelcomeEmailProps {
  name: string;
}

export const KoalaWelcomeEmail = ({ name }: KoalaWelcomeEmailProps) => (
  <Html>
    <Head />
    <Preview>A automação começa agora.</Preview>
    <Body style={main}>
      <Container style={container}>
        <Img
          src={`https://raw.githubusercontent.com/ismael3s/CityNexus/refs/heads/main/image.webp`}
          width="100%"
          height="300"
          alt="Koala"
          style={logo}
        />
        <Text style={paragraph}>Olá {name},</Text>
        <Text style={paragraph}>
          Seja bem vindo ao CityNexus, em alguns instantes você recebera um
          contrato para confirmar seu registro.
        </Text>
        <Text style={paragraph}>
          Atenciosamente,
          <br />
          CityNexus
        </Text>
        <Hr style={hr} />
      </Container>
    </Body>
  </Html>
);

KoalaWelcomeEmail.PreviewProps = {
  name: 'Cliente do Nexus',
} as KoalaWelcomeEmailProps;

export default KoalaWelcomeEmail;

const main = {
  backgroundColor: '#ffffff',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
};

const logo: CSSProperties = {
  borderRadius: '8px',
  objectFit: 'fill',
};

const paragraph = {
  fontSize: '16px',
  lineHeight: '26px',
};

const hr = {
  borderColor: '#cccccc',
  margin: '20px 0',
};
