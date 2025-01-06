-- Create Trades Table
CREATE TABLE "trades" (
    "id" SERIAL NOT NULL,
    "tokenAddress" character varying NOT NULL,
    "chainId" integer NOT NULL,
    "decimals" integer NOT NULL,
    "name" character varying NOT NULL,
    "symbol" character varying NOT NULL,
    "imageUrl" character varying NOT NULL,
    "totalSupply" numeric(78,0) NOT NULL,
    "boughtCount" integer NOT NULL,
    "boughtAmount" numeric(30,10) NOT NULL,
    "soldCount" integer NOT NULL,
    "soldAmount" numeric(30,10) NOT NULL,
    "totalCount" integer NOT NULL,
    "pnlAmount" numeric(30,10) NOT NULL,
    "pnlPercent" numeric(10,2) NOT NULL,
    "userId" integer NOT NULL,
    CONSTRAINT "PK_c6d7c36a837411ba5194dc58595" PRIMARY KEY ("id")
);

-- Create Users Table
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "address" character varying NOT NULL,
    "fullDomain" character varying NOT NULL,
    "avatar" character varying,
    "description" character varying,
    CONSTRAINT "UQ_b0ec0293d53a1385955f9834d5c" UNIQUE ("address"),
    CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
);

-- Create Activity Table
CREATE TABLE "activity" (
    "id" character varying NOT NULL,
    "block" integer NOT NULL,
    "category" character varying NOT NULL,
    "date" TIMESTAMP NOT NULL,
    "toAddress" character varying,
    "chainName" character varying,
    "chainUrl" character varying,
    "chainImage" character varying,
    "methodName" character varying,
    "methodSuffix" character varying,
    "toName" character varying,
    "toImage" character varying,
    "shareUrl" character varying,
    "shareImage" character varying,
    "shareTitle" character varying,
    "tokens" json,
    "gallery" json,
    "copies" json,
    "userId" integer NOT NULL,
    CONSTRAINT "PK_24625a1d6b1b089c8ae206fe467" PRIMARY KEY ("id")
);

-- Add Foreign Keys
ALTER TABLE "trades"
ADD CONSTRAINT "FK_b09eef25e1f2cc0ca543e80fbe6" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "activity"
ADD CONSTRAINT "FK_3571467bcbe021f66e2bdce96ea" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
